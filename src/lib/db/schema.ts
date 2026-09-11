import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  barcode: text("barcode").primaryKey(),
  name: text("name"),
  brand: text("brand"),
  imageUrl: text("image_url"),
  ingredientsText: text("ingredients_text"),
  allergensTags: text("allergens_tags"),
  tracesTags: text("traces_tags"),
  glutenStatus: text("gluten_status", {
    enum: ["gluten_free", "contains_gluten", "may_contain_traces", "unknown"],
  }).notNull(),
  glutenReason: text("gluten_reason"),
  allergensJson: text("allergens_json"),
  source: text("source").notNull().default("openfoodfacts"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  barcode: text("barcode").notNull(),
  message: text("message").notNull(),
  suggestedStatus: text("suggested_status", {
    enum: ["gluten_free", "contains_gluten", "may_contain_traces", "unknown"],
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
