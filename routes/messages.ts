import { Router } from "express";
import { db } from "../db";
import { messages, users } from "../db/schema";
import { eq, or, and, asc, ne } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/messages/users — tous les users sauf soi-même
router.get("/users", async (req: AuthRequest, res) => {
  const others = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(ne(users.id, req.userId!));
  res.json(others);
});

// GET /api/messages/:userId — conversation complète avec un user
router.get("/:userId", async (req: AuthRequest, res) => {
  const otherId = parseInt(req.params.userId as string);
  const myId = req.userId!;

  const conversation = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, myId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, myId))
      )
    )
    .orderBy(asc(messages.createdAt));

  res.json(conversation);
});

export default router;