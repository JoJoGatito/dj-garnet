import { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { requests, updateRequestStatusSchema } from "../../shared/schema";
import { z } from "zod";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" })
    };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    const id = event.path.split("/").pop();
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Request body is missing" })
      }
    }
    const validatedData = updateRequestStatusSchema.parse(JSON.parse(event.body));

    const result = await db.update(requests)
      .set({ status: validatedData.status })
      .where(eq(requests.id, id as string))
      .returning();

    if (!result) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Request not found" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid status data", errors: error.errors })
      };
    } else {
      console.error("API Error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Failed to update request status" })
      };
    }
  }
};

export { handler };