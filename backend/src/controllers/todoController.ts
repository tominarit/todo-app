import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db/index";
import { todos } from "../db/schema";
import { eq, and } from "drizzle-orm"
import { getUserByClerkId } from "../db/helpers";

export const getTodos = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    try {
      const user = await getUserByClerkId(userId!);

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      const allTodos = await db.select().from(todos).where(eq(todos.userId, user.id));
      res.status(200).json(allTodos);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
};

export const createTodo = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { title, description, priority, dueDate } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    const newTodo = await db.insert(todos).values({
      userId: user.id,
      title,
      ...(description && { description }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
    }).returning();

    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id } = req.params;
    const { title, description, priority, dueDate, status } = req.body;

    const [existingTodo] = await db.select().from(todos)
      .where(and(eq(todos.id, Number(id)), eq(todos.userId, user.id)))
      .limit(1);

    if (!existingTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = await db.update(todos).set({
      ...(title && { title }),
      ...(description && { description }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(status && { status }),
      ...(status === 'completed' && { completedAt: new Date() }),
      updatedAt: new Date(),
    }).where(and(eq(todos.id, Number(id)), eq(todos.userId, user.id)))
      .returning();

    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const user = await getUserByClerkId(userId!);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id } = req.params;

    const [existingTodo] = await db.select().from(todos)
      .where(and(eq(todos.id, Number(id)), eq(todos.userId, user.id)))
      .limit(1);

    if (!existingTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    await db.delete(todos).where(eq(todos.id, Number(id)));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
};