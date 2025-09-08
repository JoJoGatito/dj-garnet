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
    console.log("Status update request for ID:", id);
    
    if (!event.body) {
      console.log("Missing request body");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Request body is missing" })
      }
    }
    
    const parsedBody = JSON.parse(event.body);
    console.log("Status update body:", parsedBody);
    
    const validatedData = updateRequestStatusSchema.parse(parsedBody);
    console.log("Validated status:", validatedData.status);

    const result = await db.update(requests)
      .set({ status: validatedData.status })
      .where(eq(requests.id, id as string))
      .returning();
    
    console.log("Status update DB result:", result);

    if (!result || result.length === 0) {
      console.log("Request not found for ID:", id);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Request not found" })
      };
    }

    console.log("Successfully updated status for ID:", id, "to:", validatedData.status);
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