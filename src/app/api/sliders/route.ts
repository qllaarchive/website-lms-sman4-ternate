import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sliders = await prisma.slider.findMany({
    where: { pub: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ sliders });
}
