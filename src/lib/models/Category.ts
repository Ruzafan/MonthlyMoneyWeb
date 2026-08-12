import { Schema, model, models, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    color: { type: String, required: true },
    budgetLimit: { type: Number, min: 0 },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: string };

export const Category = models.Category || model("Category", categorySchema);
