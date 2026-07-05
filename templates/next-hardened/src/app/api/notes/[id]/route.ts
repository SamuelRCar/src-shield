import { toPublicError } from "@src/shield";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { log } from "@/lib/shield";
import { getNote } from "@/services/notes";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const note = await getNote(getDb(), session?.user, id);
    return Response.json(note);
  } catch (err) {
    const { status, body } = toPublicError(err, log.error);
    return Response.json(body, { status });
  }
}
