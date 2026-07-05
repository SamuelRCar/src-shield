import { AppError, parseOrThrow, requireUser, toPublicError } from "@src/shield";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { generateMfaSecret, mfaEnrollUrl, verifyMfaCode } from "@/lib/mfa";
import { log } from "@/lib/shield";

export const dynamic = "force-dynamic";

/** POST: inicia a ativação do MFA — gera segredo e devolve a URL otpauth (QR code). */
export async function POST() {
  try {
    const session = await auth();
    const user = requireUser(session?.user);
    const secret = generateMfaSecret();
    await getDb().user.update({
      where: { id: String(user.id) },
      data: { mfaSecret: secret, mfaEnabled: false },
    });
    log.security("mfa_enroll_iniciado", { userId: user.id });
    return Response.json({
      otpauthUrl: mfaEnrollUrl(session!.user.email ?? String(user.id), secret),
    });
  } catch (err) {
    const { status, body } = toPublicError(err, log.error);
    return Response.json(body, { status });
  }
}

const ConfirmSchema = z.object({ code: z.string().min(6).max(10) });

/** PUT: confirma o código do app autenticador e ativa o MFA. */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    const user = requireUser(session?.user);
    const { code } = parseOrThrow(ConfirmSchema, await req.json().catch(() => null));
    const dbUser = await getDb().user.findUnique({ where: { id: String(user.id) } });
    if (!dbUser?.mfaSecret || !verifyMfaCode(dbUser.mfaSecret, code)) {
      throw new AppError("código MFA inválido na ativação", {
        status: 400,
        publicMessage: "Código inválido.",
      });
    }
    await getDb().user.update({ where: { id: dbUser.id }, data: { mfaEnabled: true } });
    log.security("mfa_ativado", { userId: dbUser.id });
    return Response.json({ ok: true });
  } catch (err) {
    const { status, body } = toPublicError(err, log.error);
    return Response.json(body, { status });
  }
}
