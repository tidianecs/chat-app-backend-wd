import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Tous les champs sont requis" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ username, email, password: hashed })
      .returning({ id: users.id, username: users.username, email: users.email });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.message?.includes("UNIQUE")) return res.status(409).json({ error: "Email ou username déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Identifiants incorrects" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const [user] = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(eq(users.id, userId));
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
});

export default router;