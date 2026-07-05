// Cria (ou atualiza) um usuário com senha argon2id.
// Uso: node scripts/create-user.mjs email@dominio.com "senha-forte" [role]
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const [email, password, role = "member"] = process.argv.slice(2);

if (!email || !password) {
  console.error('Uso: node scripts/create-user.mjs email@dominio.com "senha" [role]');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Senha precisa ter ao menos 12 caracteres (checklist item 2).");
  process.exit(1);
}

const prisma = new PrismaClient();
const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
});

const user = await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  create: { email: email.toLowerCase(), passwordHash, role },
  update: { passwordHash, role },
});

console.log(`Usuário ${user.email} pronto (role: ${user.role}).`);
await prisma.$disconnect();
