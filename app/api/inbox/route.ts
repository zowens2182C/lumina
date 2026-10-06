import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    provider: "gmail",
    connected: Boolean(process.env.GMAIL_ACCESS_TOKEN),
    messages: [],
    setup: "Gmail OAuth is not configured yet.",
  });
}
