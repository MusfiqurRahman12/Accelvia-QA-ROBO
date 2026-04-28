import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { captureScreenshot, extractTypography } from "@/lib/engine/screenshot";
import { computeDiff } from "@/lib/engine/differ";
import { compareTypography } from "@/lib/engine/typography-compare";
import { parseFigmaUrl, exportFrameAsPng, getTextStyles } from "@/lib/engine/figma";
import { analyzeWithAI } from "@/lib/engine/ai-analyzer";
import { uploadImage } from "@/lib/storage";
import { Viewport } from "@/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const projectName = formData.get("projectName") as string || "Untitled Comparison";
    const referenceType = formData.get("referenceType") as string;
    const referenceSource = formData.get("referenceSource") as string;
    const referenceFile = formData.get("referenceFile") as File | null;
    const devUrl = formData.get("devUrl") as string;
    const viewportsStr = formData.get("viewports") as string;
    const enableAI = formData.get("enableAI") === "true";
    const enableTypography = formData.get("enableTypography") === "true";

    if (!devUrl || !referenceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const viewports: Viewport[] = JSON.parse(viewportsStr || '[{"width":1440,"height":900}]');

    // Create project
    const project = await prisma.project.create({
      data: { name: projectName, userId: session.user.id },
    });

    // Create comparison records
    const comparisonIds: string[] = [];

    for (const viewport of viewports) {
      const comparison = await prisma.comparison.create({
        data: {
          projectId: project.id,
          referenceType,
          referenceSource: referenceSource || "upload",
          devUrl,
          viewport: viewport as object,
          status: "processing",
        },
      });
      comparisonIds.push(comparison.id);
    }

    // Process comparisons in background (non-blocking)
    processComparisons({
      comparisonIds,
      referenceType,
      referenceSource,
      referenceFile,
      devUrl,
      viewports,
      enableAI,
      enableTypography,
      userId: session.user.id,
    }).catch(console.error);

    return NextResponse.json({
      projectId: project.id,
      comparisonIds,
    }, { status: 201 });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function processComparisons(params: {
  comparisonIds: string[];
  referenceType: string;
  referenceSource: string;
  referenceFile: File | null;
  devUrl: string;
  viewports: Viewport[];
  enableAI: boolean;
  enableTypography: boolean;
  userId: string;
}) {
  const { comparisonIds, referenceType, referenceSource, referenceFile, devUrl, viewports, enableAI, enableTypography, userId } = params;

  for (let i = 0; i < comparisonIds.length; i++) {
    const comparisonId = comparisonIds[i];
    const viewport = viewports[i];

    try {
      // Step 1: Get reference image
      let refBuffer: Buffer;

      if (referenceType === "figma") {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.figmaToken) throw new Error("Figma token not configured");
        const { fileKey, nodeId } = parseFigmaUrl(referenceSource);
        if (!nodeId) throw new Error("Figma URL must include a node ID");
        refBuffer = await exportFrameAsPng(fileKey, nodeId, user.figmaToken);
      } else if (referenceType === "url") {
        refBuffer = await captureScreenshot(referenceSource, viewport);
      } else if (referenceType === "image" && referenceFile) {
        const arrayBuffer = await referenceFile.arrayBuffer();
        refBuffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error("Invalid reference type");
      }

      // Step 2: Capture dev screenshot
      const devBuffer = await captureScreenshot(devUrl, viewport);

      // Step 3: Compute diff
      const diffResult = await computeDiff(refBuffer, devBuffer);

      // Step 4: Upload images
      const timestamp = Date.now();
      const refUrl = await uploadImage(refBuffer, `${comparisonId}/ref-${timestamp}.png`);
      const devUrl2 = await uploadImage(devBuffer, `${comparisonId}/dev-${timestamp}.png`);
      const diffUrl = await uploadImage(diffResult.diffBuffer, `${comparisonId}/diff-${timestamp}.png`);

      // Step 5: Typography comparison (if enabled)
      if (enableTypography) {
        let refTypography;

        if (referenceType === "figma") {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          const { fileKey, nodeId } = parseFigmaUrl(referenceSource);
          refTypography = await getTextStyles(fileKey, nodeId, user!.figmaToken!);
        } else if (referenceType === "url") {
          refTypography = await extractTypography(referenceSource, viewport);
        }

        if (refTypography) {
          const devTypography = await extractTypography(devUrl, viewport);
          const mismatches = compareTypography(refTypography, devTypography);

          for (const mismatch of mismatches) {
            await prisma.typographyDiff.create({
              data: { comparisonId, ...mismatch },
            });
          }
        }
      }

      // Step 6: AI analysis (if enabled)
      if (enableAI) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.openaiKey) {
          const aiBugs = await analyzeWithAI(
            refBuffer.toString("base64"),
            devBuffer.toString("base64"),
            diffResult.diffBuffer.toString("base64"),
            user.openaiKey
          );

          for (const bug of aiBugs) {
            await prisma.aIBug.create({
              data: { comparisonId, ...bug },
            });
          }
        }
      }

      // Update comparison status
      await prisma.comparison.update({
        where: { id: comparisonId },
        data: {
          status: "done",
          mismatchPercent: diffResult.mismatchPercent,
          refScreenshotUrl: refUrl,
          devScreenshotUrl: devUrl2,
          diffImageUrl: diffUrl,
        },
      });
    } catch (error) {
      console.error(`Comparison ${comparisonId} failed:`, error);
      await prisma.comparison.update({
        where: { id: comparisonId },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}
