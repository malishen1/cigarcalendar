import { 
  type User, 
  type InsertUser,
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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; email: string; password: string }): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  getCigar(id: string): Promise<Cigar | undefined>;
  getAllCigars(): Promise<Cigar[]>;
  createCigar(cigar: InsertCigar): Promise<Cigar>;
  updateCigar(id: string, cigar: Partial<Cigar>): Promise<Cigar | undefined>;
  deleteCigar(id: string): Promise<boolean>;
  
  getRelease(id: string): Promise<Release | undefined>;
  getAllReleases(): Promise<Release[]>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, release: Partial<Release>): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
  
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  rsvpEvent(id: string): Promise<Event | null>;
  
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  deleteCommunityPost(id: string): Promise<boolean>;
  likeCommunityPost(id: string): Promise<CommunityPost | undefined>;
  commentOnCommunityPost(id: string): Promise<CommunityPost | undefined>;
  hasLiked(postId: string, userId: string): Promise<boolean>;
  toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likes: number }>;
  getComments(postId: string): Promise<any[]>;
  createComment(comment: any): Promise<any>;
  deleteComment(id: string): Promise<boolean>;
}

class DbStorage implements IStorage {
  constructor() { 
    this.seedIfEmpty(); 
  }

  private async seedIfEmpty() {
    try {
      const existingReleases = await db.select().from(releases).limit(1);
      if (existingReleases.length === 0) {
        await db.insert(releases).values([
          { name: 'Cohiba Behike BHK 52', brand: 'Cohiba', releaseDate: new Date('2026-04-15'), region: 'UK & Europe', availability: 'Limited', description: 'Ultra-premium Behike line with limited UK & Europe allocation.' },
          { name: 'Montecristo No. 2 Edición Limitada', brand: 'Montecristo', releaseDate: new Date('2026-05-01'), region: 'UK & Europe', availability: 'Limited', description: 'Special limited edition aged 18 months for added complexity.' },
          { name: 'Romeo y Julieta Wide Churchills', brand: 'Romeo y Julieta', releaseDate: new Date('2026-03-20'), region: 'UK', availability: 'Available', description: 'Wider ring gauge take on the classic Churchill format.' },
        ]);
      }
      const existingEvents = await db.select().from(events).limit(1);
      if (existingEvents.length === 0) {
        await db.insert(events).values([
          { name: 'London Cigar Tasting Evening', date: new Date('2026-04-18T19:00:00'), location: "Davidoff of London, St James's", type: 'Tasting', description: 'Exclusive evening of premium Cuban cigars paired with aged rum.', attendees: 12 },
          { name: 'Manchester Cigar Social', date: new Date('2026-05-03T18:30:00'), location: 'The Smoking Room, Manchester', type: 'Social', description: 'Monthly meetup for cigar enthusiasts in the North West.', attendees: 8 },
          { name: 'European Cigar Festival 2026', date: new Date('2026-06-20T10:00:00'), location: 'Amsterdam, Netherlands', type: 'Festival', description: 'Premier cigar festival in Europe. 50+ brands and exclusive releases.', attendees: 320 },
        ]);
      }
    } catch (e) { 
      console.error('Seed error:', e); 
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(userData: { username: string; email: string; password: string }): Promise<User> {
    const result = await db.insert(users).values({ username: userData.username, password: userData.password }).returning();
    return result[0];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.password !== password) return null;
    return user;
  }

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
    return (result.rowCount ?? 0) > 0;
  }

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
    return (result.rowCount ?? 0) > 0;
  }

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

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async rsvpEvent(id: string): Promise<Event | null> {
    const event = await this.getEvent(id);
    if (!event) return null;
    const result = await db.update(events).set({ attendees: sql`${events.attendees} + 1` }).where(eq(events.id, id)).returning();
    return result[0] || null;
  }

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

  async deleteCommunityPost(id: string): Promise<boolean> {
    const result = await db.delete(communityPosts).where(eq(communityPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async likeCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.update(communityPosts).set({ likes: sql`${communityPosts.likes} + 1` }).where(eq(communityPosts.id, id)).returning();
    return result[0];
  }

  async commentOnCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.update(communityPosts).set({ comments: sql`${communityPosts.comments} + 1` }).where(eq(communityPosts.id, id)).returning();
    return result[0];
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    return false;
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    const post = await this.getCommunityPost(postId);
    if (!post) return { liked: false, likes: 0 };
    const updated = await this.likeCommunityPost(postId);
    return { liked: true, likes: updated?.likes ?? 0 };
  }

  async getComments(postId: string): Promise<any[]> {
    return [];
  }

  async createComment(comment: any): Promise<any> {
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return true;
  }
}

export const storage = new DbStorage();
