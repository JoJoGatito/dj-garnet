import { type User, type InsertUser, type Request, type InsertRequest, type UpdateRequestStatus, type InsertFeedback, type Feedback, users, requests, feedback } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Request methods
  getAllRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: string, status: UpdateRequestStatus): Promise<Request | undefined>;
  getRequest(id: string): Promise<Request | undefined>;
  
  // Feedback methods
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private requests: Map<string, Request>;

  constructor() {
    this.users = new Map();
    this.requests = new Map();
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

  async getAllRequests(): Promise<Request[]> {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = randomUUID();
    const request: Request = {
      ...insertRequest,
      id,
      status: null,
      requestedAt: new Date(),
    };
    this.requests.set(id, request);
    return request;
  }

  async updateRequestStatus(id: string, { status }: UpdateRequestStatus): Promise<Request | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, status };
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getRequest(id: string): Promise<Request | undefined> {
    return this.requests.get(id);
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackEntry: Feedback = {
      ...feedbackData,
      id,
      submittedAt: new Date(),
    };
    // For in-memory storage, we don't need to store feedback since it's going to Supabase
    return feedbackEntry;
  }
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllRequests(): Promise<Request[]> {
    return await this.db.select().from(requests).orderBy(desc(requests.requestedAt));
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const result = await this.db.insert(requests).values(insertRequest).returning();
    return result[0];
  }

  async updateRequestStatus(id: string, { status }: UpdateRequestStatus): Promise<Request | undefined> {
    const result = await this.db.update(requests)
      .set({ status })
      .where(eq(requests.id, id))
      .returning();
    return result[0];
  }

  async getRequest(id: string): Promise<Request | undefined> {
    const result = await this.db.select().from(requests).where(eq(requests.id, id)).limit(1);
    return result[0];
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const result = await this.db.insert(feedback).values(feedbackData).returning();
    return result[0];
  }
}

// Use database storage instead of memory storage
export const storage = new DbStorage();
