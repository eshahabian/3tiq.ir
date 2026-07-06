import { NextResponse } from "next/server";
import {
  getOrCreateContext,
  setStudentLevel,
  updateContext,
} from "@/lib/context/store";
import type { StudentLevel } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const ctx = getOrCreateContext(sessionId);
  return NextResponse.json(ctx);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { sessionId, studentLevel, favoriteTechnologies } = body as {
    sessionId: string;
    studentLevel?: StudentLevel;
    favoriteTechnologies?: string[];
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  if (studentLevel) {
    setStudentLevel(sessionId, studentLevel);
  }

  if (favoriteTechnologies) {
    updateContext(sessionId, { favoriteTechnologies });
  }

  const ctx = getOrCreateContext(sessionId);
  return NextResponse.json(ctx);
}
