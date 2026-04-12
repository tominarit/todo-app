import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db/index";
import { users } from "../db/schema";
import { getUserByClerkId } from "../db/helpers";
import { eq } from "drizzle-orm";

export const sync = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (user) {
      res.status(200).json(user);
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
    const user = await getUserByClerkId(userId!);

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
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { email, name } = req.body;

    if (!email && !name) {
      return res.status(400).json({ error: "At least one field (email or name) is required" });
    }

    const [updatedUser] = await db.update(users).set({
      ...(email && { email }),
      ...(name && { name }),
      updatedAt: new Date(),
    }).where(eq(users.clerkUserId, userId!)).returning();

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteMe = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.delete(users).where(eq(users.clerkUserId, userId!));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};