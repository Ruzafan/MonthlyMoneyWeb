import { Schema, model, models, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    type: { type: String, enum: ["expense", "income"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: { type: [String], default: [] },
    description: { type: String, trim: true },
    userId: { type: String, required: true, default: "default-user", index: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & { _id: string };

export const Transaction = models.Transaction || model("Transaction", transactionSchema);
