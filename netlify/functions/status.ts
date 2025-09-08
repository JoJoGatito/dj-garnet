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
    console.log("Full event object:", JSON.stringify({
      path: event.path,
      httpMethod: event.httpMethod,
      headers: event.headers,
      queryStringParameters: event.queryStringParameters,
      body: event.body ? "present" : "missing"
    }, null, 2));
    
    // Extract the ID from the path
    // Expected format: /.netlify/functions/status/[id]
    const pathParts = event.path.split('/');
    const id = event.queryStringParameters?.id || pathParts[pathParts.length - 1];
    console.log("Status update request for ID:", id, "Path parts:", pathParts);
    
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

    // Log before DB operation
    console.log("Attempting DB update with: ", {
      id: id,
      idType: typeof id,
      status: validatedData.status
    });
    
    let result;
    try {
      result = await db.update(requests)
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Database operation failed", error: String(dbError) })
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