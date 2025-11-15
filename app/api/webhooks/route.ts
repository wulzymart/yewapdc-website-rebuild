import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder for external webhook handling. This will be fleshed out when
  // concrete integrations are defined.
  return NextResponse.json({ success: true, error: null });
}
