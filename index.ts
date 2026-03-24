import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/messages";
import { setupSocket } from "./socket";

dotenv.config();

const allowedOrigins = [
  "https://chat-app-frontend-wd.vercel.app",
  "http://localhost:5173",
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));

setupSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));