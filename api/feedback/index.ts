import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { feedback, insertFeedbackSchema } from "../../shared/schema";
import { z } from "zod";

// Production-ready database connection

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: any, res: any) {
  // Enable CORS for static sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const validatedData = insertFeedbackSchema.parse(req.body);
    const result = await db.insert(feedback).values(validatedData).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
    } else {
      console.error("Feedback API Error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  }
}