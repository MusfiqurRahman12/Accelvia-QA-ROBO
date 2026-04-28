import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        figmaToken: true,
        openaiKey: true,
        geminiKey: true,
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Don't send actual tokens to client, just indicate if they exist
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        hasFigmaToken: !!user.figmaToken,
        hasOpenaiKey: !!user.openaiKey,
        hasGeminiKey: !!user.geminiKey,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.figmaToken !== undefined) updateData.figmaToken = body.figmaToken || null;
    if (body.openaiKey !== undefined) updateData.openaiKey = body.openaiKey || null;
    if (body.geminiKey !== undefined) updateData.geminiKey = body.geminiKey || null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
