import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <h1>SRC Shield — Template Next.js</h1>
      {session?.user ? (
        <p>
          Sessão ativa: <strong>{session.user.email}</strong> (papel: {session.user.role}).
          API de exemplo em <code>/api/notes</code>.
        </p>
      ) : (
        <p>
          Sem sessão. <Link href="/login">Entrar</Link>
        </p>
      )}
      <p style={{ color: "#666", fontSize: 14 }}>
        Este é o repo-modelo da Etapa 3 — substitua esta página, mantendo os padrões de
        segurança de <code>src/services/</code> e <code>src/lib/</code>.
      </p>
    </main>
  );
}
