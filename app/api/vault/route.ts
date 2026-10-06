import { NextResponse } from "next/server";
import { scanVault } from "@/lib/vault";

export async function GET() {
  try {
    return NextResponse.json(await scanVault());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vault scan failed." }, { status: 503 });
  }
}
