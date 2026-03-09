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
  type InsertCommunityPost
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
    this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    console.log('[Seed] Checking if seeding needed...');
    
    const existingReleases = Array.from(this.releases.values());
    const existingEvents = Array.from(this.events.values());

    if (existingReleases.length === 0) {
      console.log('Seeding releases...');
      const defaultReleases: InsertRelease[] = [
        {
          name: "Cohiba Behike",
          brand: "Cohiba",
          releaseDate: new Date("2024-04-15"),
          region: "Cuba",
          availability: "Limited",
          description: "Premium limited edition release"
        },
        {
          name: "Davidoff 702 Series",
          brand: "Davidoff",
          releaseDate: new Date("2024-03-20"),
          region: "UK & Europe",
          availability: "Available",
          description: "Expertly crafted blended cigar"
        },
        {
          name: "Padron 1964 Anniversary",
          brand: "Padron",
          releaseDate: new Date("2024-05-01"),
          region: "Nicaragua",
          availability: "Upcoming",
          description: "Anniversary series release"
        }
      ];

      for (const release of defaultReleases) {
        await this.createRelease(release);
      }
      console.log(`[Seed] Created ${defaultReleases.length} releases`);
    }

    if (existingEvents.length === 0) {
      console.log('Seeding events...');
      const defaultEvents: InsertEvent[] = [
        {
          name: "London Cigar Festival",
          date: new Date("2024-06-15"),
          location: "London, UK",
          type: "Festival",
          description: "Annual celebration of fine cigars",
          attendees: 500,
          link: "https://londonciagarfestival.com"
        },
        {
          name: "Davidoff Tasting Event",
          date: new Date("2024-04-20"),
          location: "Geneva, Switzerland",
          type: "Tasting",
          description: "Exclusive Davidoff cigar tasting",
          attendees: 50,
          link: "https://davidoff.com/events"
        },
        {
          name: "Virtual Lounge Night",
          date: new Date("2024-03-25"),
          location: "Online",
          type: "Virtual",
          description: "Join fellow enthusiasts online",
          attendees: 200,
          link: "https://cigarcalendar.com/lounge"
        }
      ];

      for (const event of defaultEvents) {
        await this.createEvent(event);
      }
      console.log(`[Seed] Created ${defaultEvents.length} events`);
    }

    console.log('[Seed] Seeding complete');
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

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
      attendees: insertEvent.attendees ?? null,
      link: insertEvent.link ?? null
    };
    this.events.set(id, event);
    return event;
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

export const storage = new MemStorage();
