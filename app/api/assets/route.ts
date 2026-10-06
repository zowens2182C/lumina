import { NextResponse } from "next/server";
import { listAssets } from "@/lib/vault";

export async function GET() { try { return NextResponse.json({ assets: await listAssets() }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Asset scan failed." }, { status: 503 }); } }
