import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let client: PrismaClient | undefined;

function getPrismaClient() {
  if (client) return client;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');
  client =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl })
    });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

// Importing a protected route must not open a database connection during build.
// The client is created only when a query or transaction is actually requested.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getPrismaClient();
    const value = Reflect.get(instance, property, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
