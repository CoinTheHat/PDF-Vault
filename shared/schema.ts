import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// CV Proof Record Schema
// This represents a verified CV proof stored on-chain (or mocked)
export const cvProofs = pgTable("cv_proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  fileHash: text("file_hash").notNull(), // SHA-256 hash of the original PDF
  sealObjectId: text("seal_object_id").notNull(), // Seal encryption policy object ID
  ciphertextHash: text("ciphertext_hash").notNull(), // SHA-256 hash of encrypted data
  contentId: text("content_id").notNull(), // Walrus content ID (stores encrypted CV)
  storageUrl: text("storage_url").notNull(), // URL to retrieve encrypted CV from Walrus
  txHash: text("tx_hash").notNull(), // Sui transaction hash
  proofCode: text("proof_code").notNull().unique(), // Unique shareable proof code
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCVProofSchema = createInsertSchema(cvProofs).omit({
  id: true,
  createdAt: true,
});

export type InsertCVProof = z.infer<typeof insertCVProofSchema>;
export type CVProof = typeof cvProofs.$inferSelect;

// Keep existing user schema for reference (can be removed if not needed)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
