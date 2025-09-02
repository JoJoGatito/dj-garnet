import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artist: text("artist").notNull(),
  title: text("title").notNull(),
  status: text("status").$type<"played" | "coming-up" | "maybe" | null>(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRequestSchema = createInsertSchema(requests).pick({
  artist: true,
  title: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  message: true,
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(["played", "coming-up", "maybe"]).nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type UpdateRequestStatus = z.infer<typeof updateRequestStatusSchema>;
