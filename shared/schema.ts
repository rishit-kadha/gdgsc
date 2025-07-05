import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  exp: integer("exp").default(0),
  level: integer("level").default(1),
  rank: varchar("rank").default("Beginner"),
  role: varchar("role").default("member"), // member, moderator, admin
  projectsCompleted: integer("projects_completed").default(0),
  workshopsAttended: integer("workshops_attended").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: varchar("status").notNull().default("upcoming"), // upcoming, ongoing, completed
  participants: integer("participants").default(0),
  imageUrl: varchar("image_url"),
  skillGained: varchar("skill_gained"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(),
  bio: text("bio"),
  imageUrl: varchar("image_url"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userEventParticipations = pgTable("user_event_participations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  participationDate: timestamp("participation_date").defaultNow(),
  rank: varchar("rank"), // for competitions
  expGained: integer("exp_gained").default(0),
  motivation: text("motivation"),
  experience: varchar("experience"),
  expectations: text("expectations"),
  dietaryRestrictions: text("dietary_restrictions"),
  emergencyContact: varchar("emergency_contact"),
  tshirtSize: varchar("tshirt_size"),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  requiredExp: integer("required_exp").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  eventParticipations: many(userEventParticipations),
  badges: many(userBadges),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(userEventParticipations),
}));

export const userEventParticipationsRelations = relations(userEventParticipations, ({ one }) => ({
  user: one(users, {
    fields: [userEventParticipations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [userEventParticipations.eventId],
    references: [events.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  createdAt: true,
});

export const insertUserEventParticipationSchema = createInsertSchema(userEventParticipations).omit({
  id: true,
  participationDate: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type UserEventParticipation = typeof userEventParticipations.$inferSelect;
export type InsertUserEventParticipation = z.infer<typeof insertUserEventParticipationSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
