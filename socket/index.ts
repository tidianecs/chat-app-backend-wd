import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { messages } from "../db/schema";

export const setupSocket = (io: Server) => {
  const onlineUsers = new Map<number, string>(); // userId → socketId

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error("Non authentifié"));
    }
  });

  io.on("connection", (socket) => {
    const userId: number = socket.data.userId;
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));

    socket.on("send_message", async ({ receiverId, content }) => {
      const [msg] = await db
        .insert(messages)
        .values({ senderId: userId, receiverId, content })
        .returning();

      // Envoie au destinataire s'il est connecté
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit("new_message", msg);

      // Confirme à l'expéditeur
      socket.emit("message_sent", msg);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};