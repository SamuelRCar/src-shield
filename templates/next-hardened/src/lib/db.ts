import { PrismaClient } from "@prisma/client";

// Lazy: instanciar só no primeiro uso evita exigir DATABASE_URL durante o build
// e permite injetar um fake nos testes (services recebem o db como parâmetro).
declare global {
  var __prisma: PrismaClient | undefined;
}

export function getDb(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient();
  }
  return globalThis.__prisma;
}
