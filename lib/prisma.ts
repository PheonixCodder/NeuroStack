import { PrismaClient } from "@/lib/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
