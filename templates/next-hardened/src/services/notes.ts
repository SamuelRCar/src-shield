import { parseOrThrow, requireOwner, requireUser, type ShieldUser } from "@src/shield";
import { z } from "zod";

/**
 * Camada de serviço do recurso de exemplo. O padrão a copiar para qualquer
 * entidade do projeto (A01/A05):
 * - requireUser no início — 401 sem sessão
 * - requireOwner em TODO acesso a item — 403 cross-usuário
 * - parseOrThrow em TODA escrita — 400 sem ecoar o payload
 * O db entra por parâmetro: produção passa getDb(), testes passam um fake.
 */

export const NoteInput = z.object({
  title: z.string().min(1).max(120),
  content: z.string().max(10_000),
});

export interface Note {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface NotesDb {
  note: {
    findMany(args: { where: { ownerId: string }; orderBy: { createdAt: "desc" } }): Promise<Note[]>;
    findUnique(args: { where: { id: string } }): Promise<Note | null>;
    create(args: { data: { ownerId: string; title: string; content: string } }): Promise<Note>;
  };
}

export async function listNotes(db: NotesDb, sessionUser: ShieldUser | null | undefined): Promise<Note[]> {
  const user = requireUser(sessionUser);
  return db.note.findMany({ where: { ownerId: String(user.id) }, orderBy: { createdAt: "desc" } });
}

export async function getNote(db: NotesDb, sessionUser: ShieldUser | null | undefined, id: string): Promise<Note> {
  const user = requireUser(sessionUser);
  const note = await db.note.findUnique({ where: { id } });
  // Nota inexistente também dá 403: não revelamos se o id existe (A01/A10)
  requireOwner(user, note?.ownerId);
  return note as Note;
}

export async function createNote(
  db: NotesDb,
  sessionUser: ShieldUser | null | undefined,
  input: unknown,
): Promise<Note> {
  const user = requireUser(sessionUser);
  const data = parseOrThrow(NoteInput, input);
  return db.note.create({ data: { ...data, ownerId: String(user.id) } });
}
