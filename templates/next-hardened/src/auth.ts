import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { validate } from "@src/shield";
import { getDb } from "./lib/db";
import { verifyPassword, hashPassword } from "./lib/password";
import { verifyMfaCode } from "./lib/mfa";
import { log, loginGuard } from "./lib/shield";

/**
 * Autenticação do template (Etapa 3 / A07):
 * - provedor comprovado (Auth.js) — login não é construído do zero
 * - argon2id via verifyPassword; tempo equalizado quando o e-mail não existe
 * - rate limit + bloqueio após 5 falhas/15min por IP+e-mail (AT-01)
 * - MFA TOTP quando habilitado no usuário
 * - sessão JWT com expiração de 8h (checklist item 2)
 */

const LoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
  totp: z.string().max(10).optional(),
});

// Hash real pré-computado de senha aleatória: quando o e-mail não existe,
// ainda rodamos o verify para não revelar existência de conta pelo tempo de resposta
let dummyHashPromise: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword("timing-equalizer-not-a-real-password");
  return dummyHashPromise;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        totp: { label: "Código MFA (se ativado)", type: "text" },
      },
      async authorize(credentials, request) {
        const parsed = validate(LoginSchema, credentials);
        if (!parsed.ok) {
          return null;
        }
        const { email, password, totp } = parsed.data;
        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

        const gate = await loginGuard.check(ip, email);
        if (!gate.allowed) {
          log.security("login_bloqueado_rate_limit", { ip, email });
          return null;
        }

        const user = await getDb().user.findUnique({ where: { email: email.toLowerCase() } });
        const ok = user
          ? await verifyPassword(user.passwordHash, password)
          : (await verifyPassword(await getDummyHash(), password), false);

        if (!user || !ok) {
          log.security("login_falhou", { ip, email });
          return null;
        }

        if (user.mfaEnabled && user.mfaSecret) {
          if (!verifyMfaCode(user.mfaSecret, totp)) {
            log.security("login_mfa_invalido", { ip, userId: user.id });
            return null;
          }
        }

        log.security("login_ok", { ip, userId: user.id });
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "member";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
