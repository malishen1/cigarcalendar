import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - updated for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Zod schemas for insertions
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
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
}).extend({
  date: z.coerce.date(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  timestamp: true,
  likes: true,
  comments: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCigar = z.infer<typeof insertCigarSchema>;
export type Cigar = typeof cigars.$inferSelect;

export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;
