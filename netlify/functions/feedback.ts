import { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { feedback, insertFeedbackSchema } from "../../shared/schema";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Request body is missing" })
      }
    }
    
    const validatedData = insertFeedbackSchema.parse(JSON.parse(event.body));
    const result = await db.insert(feedback).values(validatedData).returning();
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(result[0]),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid feedback data", errors: error.errors }),
      };
    } else {
      console.error("Feedback API Error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Failed to submit feedback" }),
      };
    }
  }
};

export { handler };