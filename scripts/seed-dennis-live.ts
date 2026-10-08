import path from "node:path";
import { readPassword } from "./seeds/read-password";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  EMAIL,
  inspectSeed,
  seedDennis,
  SeedGuardError,
} from "./seeds/dennis-portfolio";
import { verifyLiveAccess } from "./seeds/verify-live-access";

dotenv.config({
  path: [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ],
  quiet: true,
});
async function main() {
  const apply = process.argv.includes("--apply");
  if (apply && !process.argv.includes("--live"))
    throw new SeedGuardError(
      "Apply requires --live. This command writes to the configured DATABASE_URL.",
    );
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new SeedGuardError("DATABASE_URL is not configured.");
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new SeedGuardError("DATABASE_URL must be a PostgreSQL connection.");
  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname))
    throw new SeedGuardError("This live installer refuses a local database.");
  console.log("Database host:", url.hostname);
  console.log("Target account:", EMAIL);
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 15000,
    }),
  });
  try {
    const state = await inspectSeed(db);
    if (!apply) {
      console.log(
        state.project
          ? "PASS: demonstration already exists; apply will leave it unchanged."
          : "PASS: active service and administrator found; new account and private project can be created.",
      );
      return;
    }
    // Do not claim success while the live account route is disabled or unavailable.
    const response = await fetch(
      "https://systems.rcentz.cc/api/auth/get-session",
      { signal: AbortSignal.timeout(20000), redirect: "error" },
    );
    if (!response.ok)
      throw new SeedGuardError(
        "Live account endpoint is unavailable. Check production DATABASE_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL, then redeploy. No seed changes made.",
      );
    let password = await readPassword();
    const result = await seedDennis(db, password);
    const project = await db.project.findUniqueOrThrow({
      where: { id: result.projectId },
      include: {
        _count: {
          select: {
            milestones: true,
            deliverables: true,
            features: true,
            tasks: true,
            processes: true,
            approvals: true,
            files: true,
          },
        },
      },
    });
    const expected = {
      milestones: 7,
      deliverables: 7,
      features: 7,
      tasks: 21,
      processes: 7,
      approvals: 7,
      files: 7,
    };
    if (
      result.created &&
      Object.entries(expected).some(
        ([key, count]) =>
          project._count[key as keyof typeof expected] !== count,
      )
    )
      throw new SeedGuardError(
        "Seed was saved but the record count verification needs inspection. Do not reset or rerun with another identity.",
      );
    try {
      await verifyLiveAccess(password, project.id, project.serviceRequestId);
    } finally {
      password = "";
    }
    console.log(
      result.created
        ? "Created Dennis’s account and complete private demonstration."
        : "Already seeded. Credentials and project changes were preserved.",
    );
    console.log("Records:", JSON.stringify(project._count));
    console.log(
      "Open: https://systems.rcentz.cc/dashboard/projects/" + project.id,
    );
    console.log(
      "No schema migrations, payment records, email sends or analytics figures were created.",
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  // Database exception strings can contain connection details; do not echo raw errors.
  console.error(
    error instanceof SeedGuardError
      ? error.message
      : "Live seed stopped: database or network access failed. Check the connection, tables and production auth configuration. No existing account was overwritten.",
  );
  process.exitCode = 1;
});
