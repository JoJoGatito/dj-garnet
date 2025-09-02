import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { requests, updateRequestStatusSchema } from "../../../shared/schema";
import { z } from "zod";

// Production-ready database connection

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: any, res: any) {
  // Enable CORS for static sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PATCH') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { id } = req.query;
    const validatedData = updateRequestStatusSchema.parse(req.body);
    
    const result = await db.update(requests)
      .set({ status: validatedData.status })
      .where(eq(requests.id, id as string))
      .returning();
    
    if (!result[0]) {
      res.status(404).json({ message: "Request not found" });
      return;
    }
    
    res.status(200).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid status data", errors: error.errors });
    } else {
      console.error("API Error:", error);
      res.status(500).json({ message: "Failed to update request status" });
    }
  }
}