import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/vault";

export async function GET() {
  try { return NextResponse.json({ projects: await listProjects() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Project scan failed." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; description?: string };
    if (!body.name?.trim()) return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    const path = await createProject({ name: body.name.trim(), description: body.description?.trim() ?? "" });
    return NextResponse.json({ path }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create project." }, { status: 500 });
  }
}
