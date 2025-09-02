import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { desc, eq } from "drizzle-orm";
import { requests, insertRequestSchema, updateRequestStatusSchema } from "../../shared/schema";
import { z } from "zod";

// Production-ready database connection

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: any, res: any) {
  // Enable CORS for static sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const allRequests = await db.select().from(requests).orderBy(desc(requests.requestedAt));
      res.status(200).json(allRequests);
    } 
    else if (req.method === 'POST') {
      const validatedData = insertRequestSchema.parse(req.body);
      const request = await db.insert(requests).values(validatedData).returning();
      res.status(201).json(request[0]);
    } 
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid request data", errors: error.errors });
    } else {
      console.error("API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}