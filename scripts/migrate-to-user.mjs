// One-off migration: move every category/transaction owned by any other
// userId into TARGET_USER_ID. Merges categories by name+type so nothing
// gets duplicated, and re-links transactions accordingly.
//
// Usage:
//   node scripts/migrate-to-user.mjs
//
// Reads MONGODB_URI from .env.local (same var the app uses).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mongoose from "mongoose";

const TARGET_USER_ID = "117170426325947578842";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const path = join(__dirname, "..", ".env.local");
  const text = readFileSync(path, "utf-8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: "financeweb" });
  const db = mongoose.connection.db;
  const categories = db.collection("categories");
  const transactions = db.collection("transactions");

  const otherUserIds = await categories.distinct("userId", { userId: { $ne: TARGET_USER_ID } });
  const otherFromTx = await transactions.distinct("userId", { userId: { $ne: TARGET_USER_ID } });
  const allOtherIds = [...new Set([...otherUserIds, ...otherFromTx])];

  if (allOtherIds.length === 0) {
    console.log("Nothing to migrate — no data found under any other userId.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found data under ${allOtherIds.length} other user id(s):`, allOtherIds);

  let categoriesMerged = 0;
  let categoriesMoved = 0;
  let transactionsMoved = 0;

  for (const oldUserId of allOtherIds) {
    const oldCategories = await categories.find({ userId: oldUserId }).toArray();

    for (const oldCat of oldCategories) {
      const match = await categories.findOne({
        userId: TARGET_USER_ID,
        name: oldCat.name,
        type: oldCat.type,
      });

      if (match) {
        const result = await transactions.updateMany(
          { userId: oldUserId, categoryId: oldCat._id },
          { $set: { categoryId: match._id, userId: TARGET_USER_ID } }
        );
        transactionsMoved += result.modifiedCount;
        await categories.deleteOne({ _id: oldCat._id });
        categoriesMerged++;
      } else {
        await categories.updateOne({ _id: oldCat._id }, { $set: { userId: TARGET_USER_ID } });
        const result = await transactions.updateMany(
          { userId: oldUserId, categoryId: oldCat._id },
          { $set: { userId: TARGET_USER_ID } }
        );
        transactionsMoved += result.modifiedCount;
        categoriesMoved++;
      }
    }

    // Any leftover transactions for this old user without a matching category
    // (shouldn't normally happen) still get reassigned so nothing is silently lost.
    const leftover = await transactions.updateMany(
      { userId: oldUserId },
      { $set: { userId: TARGET_USER_ID } }
    );
    transactionsMoved += leftover.modifiedCount;
  }

  console.log(`Done. Categories merged into existing ones: ${categoriesMerged}`);
  console.log(`Categories moved (kept as-is): ${categoriesMoved}`);
  console.log(`Transactions moved: ${transactionsMoved}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
