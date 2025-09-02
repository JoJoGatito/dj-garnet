import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRequestSchema, updateRequestStatusSchema, insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all requests
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getAllRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Create a new request
  app.post("/api/requests", async (req, res) => {
    try {
      const validatedData = insertRequestSchema.parse(req.body);
      const request = await storage.createRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating request:", error);
        res.status(500).json({ message: "Failed to create request" });
      }
    }
  });

  // Update request status
  app.patch("/api/requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateRequestStatusSchema.parse(req.body);
      
      const updatedRequest = await storage.updateRequestStatus(id, validatedData);
      
      if (!updatedRequest) {
        res.status(404).json({ message: "Request not found" });
        return;
      }
      
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update request status" });
      }
    }
  });

  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedbackEntry = await storage.createFeedback(validatedData);
      res.status(201).json(feedbackEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      } else {
        console.error("Error creating feedback:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
