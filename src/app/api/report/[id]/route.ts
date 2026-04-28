import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const report = await prisma.bugReport.findUnique({
      where: { comparisonId: id },
      include: {
        comparison: {
          include: {
            typographyDiffs: true,
            aiBugs: true,
            project: { select: { name: true, userId: true } },
          },
        },
      },
    });

    if (!report || report.comparison.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Get comparison data
    const comparison = await prisma.comparison.findUnique({
      where: { id },
      include: {
        typographyDiffs: true,
        aiBugs: true,
        project: { select: { name: true, userId: true } },
      },
    });

    if (!comparison || comparison.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Auto-generate bug report from comparison results
    const bugs = [];
    let bugIndex = 1;

    // Add pixel diff as a bug if mismatch > 0
    if (comparison.mismatchPercent && comparison.mismatchPercent > 0.5) {
      bugs.push({
        id: `bug-${bugIndex++}`,
        title: `Visual mismatch: ${comparison.mismatchPercent.toFixed(2)}% pixel difference`,
        description: `The development build has a ${comparison.mismatchPercent.toFixed(2)}% pixel mismatch compared to the reference design.`,
        category: "visual-diff",
        severity: comparison.mismatchPercent > 5 ? "critical" : comparison.mismatchPercent > 1 ? "major" : "minor",
        screenshotUrl: comparison.diffImageUrl,
        source: "pixel-diff",
      });
    }

    // Add typography diffs
    for (const diff of comparison.typographyDiffs) {
      bugs.push({
        id: `bug-${bugIndex++}`,
        title: `${diff.property} mismatch on "${diff.textContent.substring(0, 30)}"`,
        description: `Expected ${diff.property}: ${diff.expected}, but got: ${diff.actual}`,
        category: "typography",
        severity: diff.severity,
        source: "typography",
      });
    }

    // Add AI bugs
    for (const aiBug of comparison.aiBugs) {
      bugs.push({
        id: `bug-${bugIndex++}`,
        title: `${aiBug.category}: ${aiBug.description.substring(0, 60)}`,
        description: aiBug.description,
        category: aiBug.category,
        severity: aiBug.severity,
        source: "ai",
      });
    }

    // Upsert report
    const report = await prisma.bugReport.upsert({
      where: { comparisonId: id },
      create: {
        comparisonId: id,
        title: `QA Report: ${comparison.project.name}`,
        summary: `Found ${bugs.length} issues across visual diff, typography, and AI analysis.`,
        content: { bugs, notes: "" },
      },
      update: {
        title: `QA Report: ${comparison.project.name}`,
        content: { bugs, notes: "" },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const report = await prisma.bugReport.findUnique({
      where: { comparisonId: id },
      include: { comparison: { include: { project: { select: { userId: true } } } } },
    });

    if (!report || report.comparison.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.bugReport.update({
      where: { comparisonId: id },
      data: {
        title: body.title || report.title,
        summary: body.summary || report.summary,
        content: body.content || report.content,
      },
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
