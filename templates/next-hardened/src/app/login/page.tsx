"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      totp: form.get("totp"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      // Mensagem única para qualquer falha: não revelar se o e-mail existe (A07)
      setError("E-mail, senha ou código inválidos.");
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <label>
          E-mail
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
        <label>
          Senha
          <input name="password" type="password" required maxLength={200} autoComplete="current-password" />
        </label>
        <label>
          Código MFA (se ativado)
          <input name="totp" inputMode="numeric" maxLength={10} autoComplete="one-time-code" />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
