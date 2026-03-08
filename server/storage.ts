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
  type PostComment,
  type InsertPostComment,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  upsertUser(user: UpsertUser): Promise<User>;
  getCigar(id: string): Promise<Cigar | undefined>;
  getAllCigars(): Promise<Cigar[]>;
  createCigar(cigar: InsertCigar): Promise<Cigar>;
  updateCigar(id: string, cigar: Partial<Cigar>): Promise<Cigar | undefined>;
  deleteCigar(id: string): Promise<boolean>;
  getRelease(id: string): Promise<Release | undefined>;
  getAllReleases(): Promise<Release[]>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(
    id: string,
    release: Partial<Release>,
  ): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  rsvpEvent(id: string): Promise<Event | null>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  deleteCommunityPost(id: string): Promise<boolean>;
  hasLiked(postId: string, userId: string): Promise<boolean>;
  toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likes: number }>;
  likeCommunityPost(id: string): Promise<CommunityPost | undefined>;
  commentOnCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getComments(postId: string): Promise<PostComment[]>;
  createComment(comment: InsertPostComment): Promise<PostComment>;
  deleteComment(id: string): Promise<boolean>;
}

import { DbStorage } from "./dbStorage";
export const storage = new DbStorage();
