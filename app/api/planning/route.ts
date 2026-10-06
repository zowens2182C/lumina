import { NextResponse } from "next/server";
import { createPlan, listPlans } from "@/lib/vault";

export async function GET() { try { return NextResponse.json({ plans: await listPlans() }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Planning scan failed." }, { status: 503 }); } }
export async function POST(request: Request) {
  try {
    const body = await request.json() as { title?: string; date?: string; platform?: string };
    if (!body.title?.trim() || !body.date) return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
    return NextResponse.json({ plan: await createPlan({ title: body.title.trim(), date: body.date, platform: body.platform ?? "All channels" }) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create plan." }, { status: 500 }); }
}
