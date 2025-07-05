var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  badges: () => badges,
  events: () => events,
  eventsRelations: () => eventsRelations,
  insertBadgeSchema: () => insertBadgeSchema,
  insertEventSchema: () => insertEventSchema,
  insertMentorSchema: () => insertMentorSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserEventParticipationSchema: () => insertUserEventParticipationSchema,
  mentors: () => mentors,
  sessions: () => sessions,
  userBadges: () => userBadges,
  userBadgesRelations: () => userBadgesRelations,
  userEventParticipations: () => userEventParticipations,
  userEventParticipationsRelations: () => userEventParticipationsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  exp: integer("exp").default(0),
  level: integer("level").default(1),
  rank: varchar("rank").default("Beginner"),
  role: varchar("role").default("member"),
  // member, moderator, admin
  projectsCompleted: integer("projects_completed").default(0),
  workshopsAttended: integer("workshops_attended").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: varchar("status").notNull().default("upcoming"),
  // upcoming, ongoing, completed
  participants: integer("participants").default(0),
  imageUrl: varchar("image_url"),
  skillGained: varchar("skill_gained"),
  createdAt: timestamp("created_at").defaultNow()
});
var mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(),
  bio: text("bio"),
  imageUrl: varchar("image_url"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  createdAt: timestamp("created_at").defaultNow()
});
var userEventParticipations = pgTable("user_event_participations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  participationDate: timestamp("participation_date").defaultNow(),
  rank: varchar("rank"),
  // for competitions
  expGained: integer("exp_gained").default(0),
  motivation: text("motivation"),
  experience: varchar("experience"),
  expectations: text("expectations"),
  dietaryRestrictions: text("dietary_restrictions"),
  emergencyContact: varchar("emergency_contact"),
  tshirtSize: varchar("tshirt_size")
});
var badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  requiredExp: integer("required_exp").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  eventParticipations: many(userEventParticipations),
  badges: many(userBadges)
}));
var eventsRelations = relations(events, ({ many }) => ({
  participants: many(userEventParticipations)
}));
var userEventParticipationsRelations = relations(userEventParticipations, ({ one }) => ({
  user: one(users, {
    fields: [userEventParticipations.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [userEventParticipations.eventId],
    references: [events.id]
  })
}));
var userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id]
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id]
  })
}));
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true
});
var insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  createdAt: true
});
var insertUserEventParticipationSchema = createInsertSchema(userEventParticipations).omit({
  id: true,
  participationDate: true
});
var insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true
});
var insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Event operations
  async getEvents() {
    return await db.select().from(events).orderBy(desc(events.date));
  }
  async createEvent(event) {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
  // Mentor operations
  async getMentors() {
    return await db.select().from(mentors);
  }
  async createMentor(mentor) {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }
  // User event participation operations
  async getUserEventParticipations(userId) {
    return await db.select({
      id: userEventParticipations.id,
      userId: userEventParticipations.userId,
      eventId: userEventParticipations.eventId,
      participationDate: userEventParticipations.participationDate,
      rank: userEventParticipations.rank,
      expGained: userEventParticipations.expGained,
      motivation: userEventParticipations.motivation,
      experience: userEventParticipations.experience,
      expectations: userEventParticipations.expectations,
      dietaryRestrictions: userEventParticipations.dietaryRestrictions,
      emergencyContact: userEventParticipations.emergencyContact,
      tshirtSize: userEventParticipations.tshirtSize,
      event: {
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        status: events.status,
        participants: events.participants,
        imageUrl: events.imageUrl,
        skillGained: events.skillGained,
        createdAt: events.createdAt
      }
    }).from(userEventParticipations).innerJoin(events, eq(userEventParticipations.eventId, events.id)).where(eq(userEventParticipations.userId, userId)).orderBy(desc(userEventParticipations.participationDate));
  }
  async addUserEventParticipation(participation) {
    const [newParticipation] = await db.insert(userEventParticipations).values(participation).returning();
    return newParticipation;
  }
  // Badge operations
  async getBadges() {
    return await db.select().from(badges);
  }
  async getUserBadges(userId) {
    return await db.select({
      id: userBadges.id,
      userId: userBadges.userId,
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      badge: {
        id: badges.id,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        color: badges.color,
        requiredExp: badges.requiredExp,
        createdAt: badges.createdAt
      }
    }).from(userBadges).innerJoin(badges, eq(userBadges.badgeId, badges.id)).where(eq(userBadges.userId, userId));
  }
  async addUserBadge(userBadge) {
    const [newUserBadge] = await db.insert(userBadges).values(userBadge).returning();
    return newUserBadge;
  }
  // Stats operations
  async getClubStats() {
    const memberCountResult = await db.select().from(users);
    const eventCountResult = await db.select().from(events);
    return {
      members: memberCountResult.length,
      projects: 45,
      // This could be calculated from a projects table if implemented
      events: eventCountResult.length,
      awards: 12
      // This could be calculated from awards or achievements if implemented
    };
  }
  // Admin operations
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async getAllEventParticipations() {
    return await db.select({
      id: userEventParticipations.id,
      userId: userEventParticipations.userId,
      eventId: userEventParticipations.eventId,
      participationDate: userEventParticipations.participationDate,
      expGained: userEventParticipations.expGained,
      event: {
        id: events.id,
        title: events.title,
        description: events.description
      },
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    }).from(userEventParticipations).innerJoin(events, eq(userEventParticipations.eventId, events.id)).innerJoin(users, eq(userEventParticipations.userId, users.id)).orderBy(desc(userEventParticipations.participationDate));
  }
  async addUserExperience(userId, expToAdd, reason) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }
    const currentExp = user.exp || 0;
    const newExp = currentExp + expToAdd;
    const newLevel = Math.floor(newExp / 100) + 1;
    const [updatedUser] = await db.update(users).set({
      exp: newExp,
      level: newLevel,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async createBadge(badgeData) {
    const [newBadge] = await db.insert(badges).values(badgeData).returning();
    return newBadge;
  }
  async updateEvent(eventId, eventData) {
    const [updatedEvent] = await db.update(events).set(eventData).where(eq(events.id, eventId)).returning();
    if (!updatedEvent) {
      throw new Error("Event not found");
    }
    return updatedEvent;
  }
  async deleteEvent(eventId) {
    await db.delete(userEventParticipations).where(eq(userEventParticipations.eventId, eventId));
    const result = await db.delete(events).where(eq(events.id, eventId));
    if (result.rowCount === 0) {
      throw new Error("Event not found");
    }
  }
  async updateUserRole(userId, role) {
    const [updatedUser] = await db.update(users).set({
      role,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const events2 = await storage.getEvents();
      res.json(events2);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/mentors", async (req, res) => {
    try {
      const mentors2 = await storage.getMentors();
      res.json(mentors2);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getClubStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/user/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEvents = await storage.getUserEventParticipations(userId);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });
  app2.get("/api/user/badges", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges2 = await storage.getUserBadges(userId);
      res.json(userBadges2);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });
  app2.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.post("/api/mentors", isAuthenticated, async (req, res) => {
    try {
      const mentorData = insertMentorSchema.parse(req.body);
      const mentor = await storage.createMentor(mentorData);
      res.json(mentor);
    } catch (error) {
      console.error("Error creating mentor:", error);
      res.status(500).json({ message: "Failed to create mentor" });
    }
  });
  app2.post("/api/user/events/:eventId/participate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId);
      const participationData = insertUserEventParticipationSchema.parse({
        userId,
        eventId,
        ...req.body
      });
      const participation = await storage.addUserEventParticipation(participationData);
      res.json(participation);
    } catch (error) {
      console.error("Error adding event participation:", error);
      res.status(500).json({ message: "Failed to add event participation" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.email !== "rkadha226@gmail.com") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/event-participations", isAuthenticated, async (req, res) => {
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
  app2.post("/api/admin/users/exp", isAuthenticated, async (req, res) => {
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
  app2.post("/api/admin/users/badge", isAuthenticated, async (req, res) => {
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
  app2.put("/api/events/:id", isAuthenticated, async (req, res) => {
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
  app2.delete("/api/events/:id", isAuthenticated, async (req, res) => {
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
  app2.post("/api/badges", isAuthenticated, async (req, res) => {
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
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges2 = await storage.getBadges();
      res.json(badges2);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  app2.post("/api/admin/users/role", isAuthenticated, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || currentUser.role !== "admin" && currentUser.email !== "rkadha226@gmail.com") {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
