import { 
  type User, 
  type UpsertUser,
  type Cigar,
  type InsertCigar,
  type Release,
  type InsertRelease,
  type Event,
  type InsertEvent,
  type CommunityPost,
  type InsertCommunityPost,
  users,
  cigars,
  releases,
  events,
  communityPosts
} from "@shared/schema";
import { db } from "../db/index";
import { eq, desc, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(userData: { username: string; email: string; password: string }): Promise<User> {
    const result = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    }).returning();
    return result[0];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: userData
    }).returning();
    return result[0];
  }

  // Cigar methods
  async getCigar(id: string): Promise<Cigar | undefined> {
    const result = await db.select().from(cigars).where(eq(cigars.id, id)).limit(1);
    return result[0];
  }

  async getAllCigars(): Promise<Cigar[]> {
    return db.select().from(cigars).orderBy(desc(cigars.date));
  }

  async createCigar(insertCigar: InsertCigar): Promise<Cigar> {
    const result = await db.insert(cigars).values(insertCigar).returning();
    return result[0];
  }

  async updateCigar(id: string, updates: Partial<Cigar>): Promise<Cigar | undefined> {
    const result = await db.update(cigars).set(updates).where(eq(cigars.id, id)).returning();
    return result[0];
  }

  async deleteCigar(id: string): Promise<boolean> {
    const result = await db.delete(cigars).where(eq(cigars.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Release methods
  async getRelease(id: string): Promise<Release | undefined> {
    const result = await db.select().from(releases).where(eq(releases.id, id)).limit(1);
    return result[0];
  }

  async getAllReleases(): Promise<Release[]> {
    return db.select().from(releases).orderBy(releases.releaseDate);
  }

  async createRelease(insertRelease: InsertRelease): Promise<Release> {
    const result = await db.insert(releases).values(insertRelease).returning();
    return result[0];
  }

  async updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined> {
    const result = await db.update(releases).set(updates).where(eq(releases.id, id)).returning();
    return result[0];
  }

  async deleteRelease(id: string): Promise<boolean> {
    const result = await db.delete(releases).where(eq(releases.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(events.date);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(insertEvent).returning();
    return result[0];
  }

  async rsvpEvent(id: string): Promise<Event | null> {
    const event = await this.getEvent(id);
    if (!event) return null;

    if (event.maxCapacity !== null && event.maxCapacity !== undefined) {
      if ((event.attendees ?? 0) >= event.maxCapacity) {
        return null;
      }
    }

    const result = await db.update(events)
      .set({ attendees: sql`${events.attendees} + 1` })
      .where(eq(events.id, id))
      .returning();
    
    return result[0] || null;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Community post methods
  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
    return result[0];
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return db.select().from(communityPosts).orderBy(desc(communityPosts.timestamp));
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const result = await db.insert(communityPosts).values(insertPost).returning();
    return result[0];
  }

  async likeCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, id))
      .returning();
    return result[0];
  }

  async commentOnCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.update(communityPosts)
      .set({ comments: sql`${communityPosts.comments} + 1` })
      .where(eq(communityPosts.id, id))
      .returning();
    return result[0];
  }
}
