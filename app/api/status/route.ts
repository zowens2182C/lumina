import { NextResponse } from "next/server";
import { configuredConnections } from "@/lib/providers";
import { vaultConnection } from "@/lib/vault";

export function GET() {
  const vault = vaultConnection();
  return NextResponse.json({
    local: true,
    providers: configuredConnections(),
    vault: { ...vault, scanEndpoint: "/api/vault" },
  });
}
