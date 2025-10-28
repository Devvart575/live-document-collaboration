import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws";
import connectDB from "./config/db.js";
import { Document } from "./model/docSchema.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//  Start WebSocket server
const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

// In-memory room tracking
const rooms = {}; // { roomName: Set<WebSocket> }

//  Handle WebSocket connections
wss.on("connection", (socket) => {
  console.log(" A user connected");

  socket.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.error(" Invalid message:", raw);
      return;
    }

    //  User joins room
    if (msg.type === "join-room") {
      const { room, name } = msg;
      socket.name = name;
      socket.room = room;

      if (!rooms[room]) rooms[room] = new Set();
      rooms[room].add(socket);
              


      // Find or create document in DB
      let document = await Document.findOne({ room });
      if (!document) document = await Document.create({ room, content: "" });

      // Send initial document content to this user
      socket.send(JSON.stringify({ type: "init", content: document.content }));

      // Broadcast join info + updated user list
      broadcast(room, { type: "info", text: `${name} joined ${room}` });
      sendUsersList(room);
      return;
    }

    // Handle live document updates
    if (msg.type === "doc-update" && socket.room) {
      const { content } = msg;

      // Update DB
      await Document.findOneAndUpdate(
        { room: socket.room },
        { content },
        { upsert: true }
      );

      // Broadcast to others in the room
      broadcast(
        socket.room,
        { type: "doc-update", content, from: socket.name },
        socket
      );
      return;
    }

    // Typing indicator
    if (msg.type === "typing" && socket.room) {
      broadcast(
        socket.room,
        { type: "typing", from: socket.name },
        socket
      );
      return;
    }

    if (msg.type === "stop-typing" && socket.room) {
      broadcast(
        socket.room,
        { type: "stop-typing", from: socket.name },
        socket
      );
      return;
    }
  });

  // Handle disconnects
  socket.on("close", () => {
     console.log("Client disconnected");
    if (socket.room && rooms[socket.room]) {
      rooms[socket.room].delete(socket);

      broadcast(socket.room, {
        type: "info",
        text: `${socket.name} left ${socket.room}`,
      });

      sendUsersList(socket.room);
    }
  });
});

// Broadcast helper (send to all except sender)
function broadcast(room, data, excludeSocket = null) {
  if (!rooms[room]) return;

  rooms[room].forEach((client) => {
    if (client.readyState === 1 && client !== excludeSocket) {
      client.send(JSON.stringify(data));
    }
  });
}

//  Send current users list to everyone in the room
function sendUsersList(room) {
  if (!rooms[room]) return;
  const users = Array.from(rooms[room]).map((s) => s.name);
  broadcast(room, { type: "users-list", users });
}
