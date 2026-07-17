import { NextResponse } from "next/server";
import { researchPerson } from "../../../lib/research/person-research";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      personName?: string;
      personRole?: string;
      personContext?: string;
      opponentText?: string;
      narrativeIntent?: string;
    };

    const pack = await researchPerson({
      personName: body.personName,
      personRole: body.personRole,
      personContext: body.personContext,
      opponentText: body.opponentText,
      narrativeIntent: body.narrativeIntent,
    });

    return NextResponse.json({ ok: true, pack });
  } catch (err) {
    const message = err instanceof Error ? err.message : "research_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
