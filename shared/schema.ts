import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cigars = pgTable("cigars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cigarName: text("cigar_name").notNull(),
  brand: text("brand"),
  rating: integer("rating").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  duration: integer("duration"),
  strength: text("strength"),
  calendarEventId: text("calendar_event_id"),
});

export const releases = pgTable("releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  releaseDate: timestamp("release_date").notNull(),
  region: text("region").notNull(),
  availability: text("availability").notNull(),
  description: text("description"),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  attendees: integer("attendees").default(0),
  maxCapacity: integer("max_capacity"),
  link: text("link"),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  cigarName: text("cigar_name").notNull(),
  brand: text("brand"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
});

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCigarSchema = createInsertSchema(cigars).omit({
  id: true,
  calendarEventId: true,
}).extend({
  date: z.coerce.date(),
});

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  timestamp: true,
  likes: true,
  comments: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCigar = z.infer<typeof insertCigarSchema>;
export type Cigar = typeof cigars.$inferSelect;

export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
