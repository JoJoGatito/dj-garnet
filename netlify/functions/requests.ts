import { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { desc } from "drizzle-orm";
import { requests, insertRequestSchema } from "../../shared/schema";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" })
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      console.log("GET request received for all requests");
      const allRequests = await db.select().from(requests).orderBy(desc(requests.requestedAt));
      console.log("Fetched requests data:", allRequests);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(allRequests),
      };
    } else if (event.httpMethod === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Request body is missing" })
        }
      }
      const validatedData = insertRequestSchema.parse(JSON.parse(event.body));
      const request = await db.insert(requests).values(validatedData).returning();
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(request),
      };
    } else if (event.httpMethod === 'DELETE') {
      const result = await db.delete(requests).returning();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ deleted: result.length }),
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid request data", errors: error.errors }),
      };
    } else {
      console.error("API Error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Internal server error" }),
      };
    }
  }
};

export { handler };