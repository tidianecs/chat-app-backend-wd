import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/messages";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));

setupSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));