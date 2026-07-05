import type { NextConfig } from "next";
import { nextSecurityHeaders } from "@src/shield";

const nextConfig: NextConfig = {
  // Etapa 3 do SRC Shield: cabeçalhos de segurança em todas as rotas.
  // Trocar o preset conforme o tipo de projeto: institucional | saas | ecommerce
  async headers() {
    return nextSecurityHeaders({ preset: "saas" });
  },
  poweredByHeader: false,
  // argon2 é módulo nativo — não pode ser empacotado pelo bundler
  serverExternalPackages: ["argon2"],
};

export default nextConfig;
