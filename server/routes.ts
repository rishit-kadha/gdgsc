import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertMentorSchema, insertUserEventParticipationSchema, insertBadgeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/mentors", async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getClubStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Protected routes
  app.get("/api/user/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEvents = await storage.getUserEventParticipations(userId);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.get("/api/user/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Admin routes (for creating events and mentors)
  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post("/api/mentors", isAuthenticated, async (req, res) => {
    try {
      const mentorData = insertMentorSchema.parse(req.body);
      const mentor = await storage.createMentor(mentorData);
      res.json(mentor);
    } catch (error) {
      console.error("Error creating mentor:", error);
      res.status(500).json({ message: "Failed to create mentor" });
    }
  });

  app.post("/api/user/events/:eventId/participate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId);
      const participationData = insertUserEventParticipationSchema.parse({
        userId,
        eventId,
        ...req.body,
      });
      const participation = await storage.addUserEventParticipation(participationData);
      res.json(participation);
    } catch (error) {
      console.error("Error adding event participation:", error);
      res.status(500).json({ message: "Failed to add event participation" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin (you can customize this logic)
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/event-participations", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const participations = await storage.getAllEventParticipations();
      res.json(participations);
    } catch (error) {
      console.error("Error fetching event participations:", error);
      res.status(500).json({ message: "Failed to fetch event participations" });
    }
  });

  app.post("/api/admin/users/exp", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const { userId, expToAdd, reason } = req.body;
      const result = await storage.addUserExperience(userId, expToAdd, reason);
      res.json(result);
    } catch (error) {
      console.error("Error adding user experience:", error);
      res.status(500).json({ message: "Failed to add user experience" });
    }
  });

  app.post("/api/admin/users/badge", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const { userId, badgeId } = req.body;
      const result = await storage.addUserBadge({ userId, badgeId });
      res.json(result);
    } catch (error) {
      console.error("Error assigning badge to user:", error);
      res.status(500).json({ message: "Failed to assign badge to user" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const eventId = parseInt(req.params.id);
      await storage.deleteEvent(eventId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const badgeData = insertBadgeSchema.parse(req.body);
      const badge = await storage.createBadge(badgeData);
      res.json(badge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.post("/api/admin/users/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || (currentUser.role !== "admin" && currentUser.email !== "rkadha226@gmail.com")) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const { userId, role } = req.body;
      if (!["member", "moderator", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be member, moderator, or admin." });
      }
      
      const result = await storage.updateUserRole(userId, role);
      res.json(result);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
