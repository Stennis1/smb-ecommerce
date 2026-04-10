import dotenv from "dotenv";
import { getPrismaClient } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const email = getArgValue("--email")?.trim().toLowerCase();
  const password = getArgValue("--password");

  if (!email || !password) {
    throw new Error(
      "Provide both --email and --password. Example: npm run admin:seed -- --email admin@example.com --password strongpassword123",
    );
  }

  const passwordHash = await hashPassword(password);
  const prisma = getPrismaClient();

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`Seeded admin: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrismaClient().$disconnect();
  });
