import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureUserInitialized } from "@/lib/seed";

/** Resolves the signed-in user's id, connects to Mongo, and makes sure their default data exists. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }
  await connectDB();
  await ensureUserInitialized(session.user.id);
  return session.user.id;
}
