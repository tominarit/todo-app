import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm"

export const sync = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const [existingUser] = await db.select().from(users).where(eq(users.clerkUserId, userId!)).limit(1);

    if (existingUser) {
      res.status(200).json(existingUser);
    } else {
      const newUser = await db.insert(users).values({ clerkUserId: userId! }).onConflictDoNothing().returning();
      res.status(201).json(newUser);
    }
  } catch (err){
    res.status(500).json({ error: "Failed to sync user" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId!)).limit(1);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const updateMe = async (req: Request, res: Response) => {

};

export const deleteMe = async (req: Request, res: Response) => {

};