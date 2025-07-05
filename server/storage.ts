import {
  users,
  events,
  mentors,
  userEventParticipations,
  badges,
  userBadges,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Mentor,
  type InsertMentor,
  type UserEventParticipation,
  type InsertUserEventParticipation,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Mentor operations
  getMentors(): Promise<Mentor[]>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  
  // User event participation operations
  getUserEventParticipations(userId: string): Promise<(UserEventParticipation & { event: Event })[]>;
  addUserEventParticipation(participation: InsertUserEventParticipation): Promise<UserEventParticipation>;
  
  // Badge operations
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  addUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // Stats operations
  getClubStats(): Promise<{
    members: number;
    projects: number;
    events: number;
    awards: number;
  }>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllEventParticipations(): Promise<any[]>;
  addUserExperience(userId: string, expToAdd: number, reason: string): Promise<User>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  updateEvent(eventId: number, eventData: InsertEvent): Promise<Event>;
  deleteEvent(eventId: number): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Mentor operations
  async getMentors(): Promise<Mentor[]> {
    return await db.select().from(mentors);
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }

  // User event participation operations
  async getUserEventParticipations(userId: string): Promise<(UserEventParticipation & { event: Event })[]> {
    return await db
      .select({
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
          createdAt: events.createdAt,
        },
      })
      .from(userEventParticipations)
      .innerJoin(events, eq(userEventParticipations.eventId, events.id))
      .where(eq(userEventParticipations.userId, userId))
      .orderBy(desc(userEventParticipations.participationDate));
  }

  async addUserEventParticipation(participation: InsertUserEventParticipation): Promise<UserEventParticipation> {
    const [newParticipation] = await db
      .insert(userEventParticipations)
      .values(participation)
      .returning();
    return newParticipation;
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return await db
      .select({
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
          createdAt: badges.createdAt,
        },
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async addUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const [newUserBadge] = await db.insert(userBadges).values(userBadge).returning();
    return newUserBadge;
  }

  // Stats operations
  async getClubStats(): Promise<{
    members: number;
    projects: number;
    events: number;
    awards: number;
  }> {
    const memberCountResult = await db.select().from(users);
    const eventCountResult = await db.select().from(events);
    
    return {
      members: memberCountResult.length,
      projects: 45, // This could be calculated from a projects table if implemented
      events: eventCountResult.length,
      awards: 12, // This could be calculated from awards or achievements if implemented
    };
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllEventParticipations(): Promise<any[]> {
    return await db
      .select({
        id: userEventParticipations.id,
        userId: userEventParticipations.userId,
        eventId: userEventParticipations.eventId,
        participationDate: userEventParticipations.participationDate,
        expGained: userEventParticipations.expGained,
        event: {
          id: events.id,
          title: events.title,
          description: events.description,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(userEventParticipations)
      .innerJoin(events, eq(userEventParticipations.eventId, events.id))
      .innerJoin(users, eq(userEventParticipations.userId, users.id))
      .orderBy(desc(userEventParticipations.participationDate));
  }

  async addUserExperience(userId: string, expToAdd: number, reason: string): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const currentExp = user.exp || 0;
    const newExp = currentExp + expToAdd;
    const newLevel = Math.floor(newExp / 100) + 1; // Simple level calculation
    
    // Update user experience and level
    const [updatedUser] = await db
      .update(users)
      .set({
        exp: newExp,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const [newBadge] = await db
      .insert(badges)
      .values(badgeData)
      .returning();
    return newBadge;
  }

  async updateEvent(eventId: number, eventData: InsertEvent): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, eventId))
      .returning();
    
    if (!updatedEvent) {
      throw new Error("Event not found");
    }
    
    return updatedEvent;
  }

  async deleteEvent(eventId: number): Promise<void> {
    // First delete related participations
    await db.delete(userEventParticipations).where(eq(userEventParticipations.eventId, eventId));
    
    // Then delete the event
    const result = await db.delete(events).where(eq(events.id, eventId));
    
    if (result.rowCount === 0) {
      throw new Error("Event not found");
    }
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        role: role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
