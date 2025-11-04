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
  type InsertCommunityPost
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; email: string; password: string }): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cigar methods
  getCigar(id: string): Promise<Cigar | undefined>;
  getAllCigars(): Promise<Cigar[]>;
  createCigar(cigar: InsertCigar): Promise<Cigar>;
  updateCigar(id: string, cigar: Partial<Cigar>): Promise<Cigar | undefined>;
  deleteCigar(id: string): Promise<boolean>;
  
  // Release methods
  getRelease(id: string): Promise<Release | undefined>;
  getAllReleases(): Promise<Release[]>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, release: Partial<Release>): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
  
  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  rsvpEvent(id: string): Promise<Event | null>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Community post methods
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(id: string): Promise<CommunityPost | undefined>;
  commentOnCommunityPost(id: string): Promise<CommunityPost | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cigars: Map<string, Cigar>;
  private releases: Map<string, Release>;
  private events: Map<string, Event>;
  private communityPosts: Map<string, CommunityPost>;

  constructor() {
    this.users = new Map();
    this.cigars = new Map();
    this.releases = new Map();
    this.events = new Map();
    this.communityPosts = new Map();
    
    // Seed initial events
    this.seedEvents();
  }

  private seedEvents() {
    const christmasEvent: Event = {
      id: randomUUID(),
      name: "Christmas Celebration",
      date: new Date("2025-12-31T19:00:00.000Z"),
      location: "Emory Cigar Lounge",
      type: "Tasting",
      description: "Join us for a special Christmas celebration at Emory Cigar Lounge! Ring in the new year with premium cigars and great company.",
      attendees: 0,
      maxCapacity: 24,
      link: null
    };
    this.events.set(christmasEvent.id, christmasEvent);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(userData: { username: string; email: string; password: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password, // In production, this should be hashed
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      username: userData.username ?? "",
      email: userData.email ?? "",
      password: "", // Not used for upsert
      createdAt: existingUser?.createdAt ?? new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Cigar methods
  async getCigar(id: string): Promise<Cigar | undefined> {
    return this.cigars.get(id);
  }

  async getAllCigars(): Promise<Cigar[]> {
    return Array.from(this.cigars.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createCigar(insertCigar: InsertCigar): Promise<Cigar> {
    const id = randomUUID();
    const cigar: Cigar = { 
      id,
      cigarName: insertCigar.cigarName,
      brand: insertCigar.brand ?? null,
      rating: insertCigar.rating,
      date: insertCigar.date,
      notes: insertCigar.notes ?? null,
      duration: insertCigar.duration ?? null,
      strength: insertCigar.strength ?? null,
      calendarEventId: null
    };
    this.cigars.set(id, cigar);
    return cigar;
  }

  async updateCigar(id: string, updates: Partial<Cigar>): Promise<Cigar | undefined> {
    const cigar = this.cigars.get(id);
    if (!cigar) return undefined;
    
    const updated = { ...cigar, ...updates };
    this.cigars.set(id, updated);
    return updated;
  }

  async deleteCigar(id: string): Promise<boolean> {
    return this.cigars.delete(id);
  }

  // Release methods
  async getRelease(id: string): Promise<Release | undefined> {
    return this.releases.get(id);
  }

  async getAllReleases(): Promise<Release[]> {
    return Array.from(this.releases.values()).sort((a, b) => 
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    );
  }

  async createRelease(insertRelease: InsertRelease): Promise<Release> {
    const id = randomUUID();
    const release: Release = { 
      id,
      name: insertRelease.name,
      brand: insertRelease.brand,
      releaseDate: insertRelease.releaseDate,
      region: insertRelease.region,
      availability: insertRelease.availability,
      description: insertRelease.description ?? null
    };
    this.releases.set(id, release);
    return release;
  }

  async updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined> {
    const release = this.releases.get(id);
    if (!release) return undefined;
    
    const updated = { ...release, ...updates };
    this.releases.set(id, updated);
    return updated;
  }

  async deleteRelease(id: string): Promise<boolean> {
    return this.releases.delete(id);
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      id,
      name: insertEvent.name,
      date: insertEvent.date,
      location: insertEvent.location,
      type: insertEvent.type,
      description: insertEvent.description ?? null,
      attendees: insertEvent.attendees ?? 0,
      maxCapacity: insertEvent.maxCapacity ?? null,
      link: insertEvent.link ?? null
    };
    this.events.set(id, event);
    return event;
  }

  async rsvpEvent(id: string): Promise<Event | null> {
    const event = this.events.get(id);
    if (!event) return null;
    
    // Check if event is at max capacity (explicit null check)
    if (event.maxCapacity !== null && event.maxCapacity !== undefined) {
      const currentAttendees = event.attendees ?? 0;
      if (currentAttendees >= event.maxCapacity) {
        return null;
      }
    }
    
    const updated = { 
      ...event, 
      attendees: (event.attendees ?? 0) + 1 
    };
    
    // Revalidate after increment to catch some race conditions
    if (updated.maxCapacity !== null && updated.maxCapacity !== undefined) {
      if (updated.attendees > updated.maxCapacity) {
        return null;
      }
    }
    
    this.events.set(id, updated);
    return updated;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updated = { ...event, ...updates };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Community post methods
  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = { 
      id,
      userName: insertPost.userName,
      userAvatar: insertPost.userAvatar ?? null,
      cigarName: insertPost.cigarName,
      brand: insertPost.brand ?? null,
      rating: insertPost.rating,
      comment: insertPost.comment ?? null,
      timestamp: new Date(),
      likes: 0,
      comments: 0
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async likeCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updated = { ...post, likes: post.likes + 1 };
    this.communityPosts.set(id, updated);
    return updated;
  }

  async commentOnCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updated = { ...post, comments: post.comments + 1 };
    this.communityPosts.set(id, updated);
    return updated;
  }
}

import { DbStorage } from "./dbStorage";

// Use database storage for persistence
export const storage = new DbStorage();
