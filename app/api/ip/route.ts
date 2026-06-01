import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return NextResponse.json({ ip });
}
