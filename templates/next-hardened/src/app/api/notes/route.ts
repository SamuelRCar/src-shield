import { toPublicError } from "@src/shield";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { apiLimiter, clientIp, log } from "@/lib/shield";
import { createNote, listNotes } from "@/services/notes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const notes = await listNotes(getDb(), session?.user);
    return Response.json(notes);
  } catch (err) {
    const { status, body } = toPublicError(err, log.error);
    return Response.json(body, { status });
  }
}

export async function POST(req: Request) {
  try {
    const gate = await apiLimiter(`notes:${clientIp(req)}`);
    if (!gate.allowed) {
      return Response.json(
        { error: "Muitas requisições." },
        { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } },
      );
    }
    const session = await auth();
    const body = await req.json().catch(() => null);
    const note = await createNote(getDb(), session?.user, body);
    return Response.json(note, { status: 201 });
  } catch (err) {
    const { status, body } = toPublicError(err, log.error);
    return Response.json(body, { status });
  }
}
