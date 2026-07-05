import { describe, expect, it } from "vitest";
import { authenticator } from "otplib";
import { AuthnError, AuthzError, ValidationError } from "@src/shield";
import { createLoginGuard } from "../src/lib/login-guard";
import { generateMfaSecret, verifyMfaCode } from "../src/lib/mfa";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { createNote, getNote, listNotes, type Note, type NotesDb } from "../src/services/notes";

// Os 3 testes de segurança obrigatórios do PLANO-MESTRE.md (Etapa 3) + defesas de apoio.

function fakeDb(notes: Note[]): NotesDb {
  return {
    note: {
      async findMany({ where }) {
        return notes.filter((n) => n.ownerId === where.ownerId);
      },
      async findUnique({ where }) {
        return notes.find((n) => n.id === where.id) ?? null;
      },
      async create({ data }) {
        const note: Note = { id: `n${notes.length + 1}`, createdAt: new Date(), ...data };
        notes.push(note);
        return note;
      },
    },
  };
}

const alice = { id: "user-alice", roles: [] as string[] };
const notaDaBia: Note = {
  id: "nota-1",
  ownerId: "user-bia",
  title: "privada",
  content: "segredo da Bia",
  createdAt: new Date(),
};

describe("1. Acesso cross-usuário é negado (A01 — validação do plano)", () => {
  it("usuário logado NÃO acessa a nota de outro usuário", async () => {
    const db = fakeDb([notaDaBia]);
    await expect(getNote(db, alice, "nota-1")).rejects.toBeInstanceOf(AuthzError);
    await expect(getNote(db, alice, "nota-1")).rejects.toMatchObject({ status: 403 });
  });

  it("nota inexistente também dá 403 — não revela se o id existe", async () => {
    await expect(getNote(fakeDb([]), alice, "nao-existe")).rejects.toMatchObject({ status: 403 });
  });

  it("listagem só devolve as notas do próprio usuário", async () => {
    const minha: Note = { ...notaDaBia, id: "nota-2", ownerId: "user-alice" };
    const lista = await listNotes(fakeDb([notaDaBia, minha]), alice);
    expect(lista).toHaveLength(1);
    expect(lista[0]!.id).toBe("nota-2");
  });

  it("sem sessão → 401", async () => {
    await expect(listNotes(fakeDb([]), null)).rejects.toBeInstanceOf(AuthnError);
  });
});

describe("2. Força bruta no login é bloqueada (AT-01 — validação do plano)", () => {
  it("bloqueia a 6ª tentativa em 15 minutos e mantém bloqueado enquanto martela", async () => {
    let t = 0;
    const guard = createLoginGuard({ now: () => t });
    for (let i = 0; i < 5; i++) {
      expect((await guard.check("9.9.9.9", "vitima@x.com")).allowed).toBe(true);
    }
    expect((await guard.check("9.9.9.9", "vitima@x.com")).allowed).toBe(false);

    // 10 senhas erradas seguidas (critério do checklist) → continua bloqueado
    for (let i = 0; i < 10; i++) {
      t += 1_000;
      expect((await guard.check("9.9.9.9", "vitima@x.com")).allowed).toBe(false);
    }
  });

  it("o bloqueio é por IP+e-mail: outro usuário não é afetado", async () => {
    let t = 0;
    const guard = createLoginGuard({ now: () => t });
    for (let i = 0; i < 6; i++) {
      await guard.check("9.9.9.9", "vitima@x.com");
    }
    expect((await guard.check("1.1.1.1", "outra@x.com")).allowed).toBe(true);
  });
});

describe("3. Entrada inválida é rejeitada sem vazar detalhes (A05/A10 — validação do plano)", () => {
  it("payload malicioso → 400 e o erro não ecoa o conteúdo", async () => {
    const payload = { title: "", content: "'; DROP TABLE notes; --".repeat(1000) };
    const err = await createNote(fakeDb([]), alice, payload).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).status).toBe(400);
    expect((err as ValidationError).publicMessage).toBe("Dados inválidos.");
    expect((err as ValidationError).message).not.toContain("DROP TABLE");
  });

  it("tipo errado e campo ausente também são rejeitados", async () => {
    await expect(createNote(fakeDb([]), alice, { title: 123 })).rejects.toMatchObject({ status: 400 });
    await expect(createNote(fakeDb([]), alice, null)).rejects.toMatchObject({ status: 400 });
  });
});

describe("Defesas de apoio: senha argon2id e MFA (A04/A07)", () => {
  it("hash e verificação de senha (argon2id) funcionam; senha errada falha", async () => {
    const hash = await hashPassword("Senha-Forte-123!");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "Senha-Forte-123!")).toBe(true);
    expect(await verifyPassword(hash, "senha-errada")).toBe(false);
    expect(await verifyPassword("hash-corrompido", "x")).toBe(false);
  });

  it("MFA: código correto passa, errado/ausente falha fechando", () => {
    const secret = generateMfaSecret();
    expect(verifyMfaCode(secret, authenticator.generate(secret))).toBe(true);
    expect(verifyMfaCode(secret, "000000")).toBe(false);
    expect(verifyMfaCode(secret, undefined)).toBe(false);
    expect(verifyMfaCode("", "123456")).toBe(false);
  });
});
