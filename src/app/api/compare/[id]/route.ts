import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const comparison = await prisma.comparison.findUnique({
      where: { id },
      include: {
        typographyDiffs: true,
        aiBugs: true,
        bugReport: true,
        project: { select: { userId: true, name: true } },
      },
    });

    if (!comparison || comparison.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Error fetching comparison:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
