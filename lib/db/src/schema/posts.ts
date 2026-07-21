import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const postsTable = pgTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  authorUsername: text("author_username").notNull(),
  authorIcon: text("author_icon"),
  authorRole: text("author_role"),
  authorIsAdmin: boolean("author_is_admin").default(false),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isAnnouncement: boolean("is_announcement").default(false),
  likes: text("likes").array().notNull().default([]),
  dislikes: text("dislikes").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DbPost = typeof postsTable.$inferSelect;
export type InsertDbPost = typeof postsTable.$inferInsert;
