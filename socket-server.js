const { createServer } = require("http");
const { Server } = require("socket.io");

const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.SOCKET_CORS_ORIGIN || process.env.APP_URL || "").split(",").map(o => o.trim()).filter(Boolean);

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: allowedOrigins.length > 0 
    ? { origin: allowedOrigins, credentials: true }
    : { origin: "*" },
  transports: ["websocket", "polling"],
});

const onlineUsers = new Map();

// ===== HELPERS =====
function normalizeId(value) {
  if (value === null || value === undefined) return "";
  return value.toString();
}

function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

function addUserSocket(userId, socketId) {
  const id = normalizeId(userId);
  if (!id || !socketId) return;

  const existing = onlineUsers.get(id);
  if (existing) {
    existing.add(socketId);
  } else {
    onlineUsers.set(id, new Set([socketId]));
  }
}

function removeUserSocket(userId, socketId) {
  const id = normalizeId(userId);
  if (!id || !socketId) return;

  const sockets = onlineUsers.get(id);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(id);
  }
}

function getSocketIdsForUsers(userIds) {
  const socketIds = new Set();

  for (const userId of userIds || []) {
    const id = normalizeId(userId);
    if (!id) continue;

    const sockets = onlineUsers.get(id);
    if (!sockets?.size) continue;

    for (const socketId of sockets) {
      socketIds.add(socketId);
    }
  }

  return socketIds;
}

function emitToUsers(userIds, eventName, payload) {
  if (!io) return false;

  const targetSocketIds = getSocketIdsForUsers(userIds);
  if (!targetSocketIds.size) return false;

  for (const socketId of targetSocketIds) {
    io.to(socketId).emit(eventName, payload);
  }

  return true;
}

// ===== SOCKET EVENTS =====
io.on("connection", (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) return;

    socket.data.userId = normalizedUserId;
    addUserSocket(normalizedUserId, socket.id);

    io.emit("online-users", getOnlineUserIds());
    console.log(`[Join] ${normalizedUserId} joined. Online: ${getOnlineUserIds().length}`);
  });

  socket.on("send-message", (data) => {
    const receiverId = data?.receiverId?.toString?.() || data?.receiver?.toString?.();

    if (!receiverId) return;

    emitToUsers([receiverId], "receive-message", data);
    emitToUsers([receiverId], "notification", {
      type: "chat",
      text: "New message",
    });
  });

  socket.on("ticket-message", (data) => {
    const { receiverId, ticketId, message } = data;
    const normalizedReceiverId = normalizeId(receiverId);

    if (!normalizedReceiverId) return;

    emitToUsers([normalizedReceiverId], "ticket-message", { ticketId, message });
    emitToUsers([normalizedReceiverId], "notification", {
      type: "ticket",
      text: "New ticket update",
      ticketId,
    });
  });

  socket.on("disconnect", () => {
    if (socket.data.userId) {
      removeUserSocket(socket.data.userId, socket.id);
    } else {
      for (const [uid, socketIds] of onlineUsers.entries()) {
        if (socketIds.has(socket.id)) {
          removeUserSocket(uid, socket.id);
          break;
        }
      }
    }

    io.emit("online-users", getOnlineUserIds());
    console.log(`[Disconnect] ${socket.data.userId || socket.id} disconnected`);
  });
});

// ===== GRACEFUL SHUTDOWN =====
const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  io.close(() => {
    httpServer.close(() => {
      console.log("Socket server closed");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`⚡ Socket server running on port ${port}`);
  console.log(`CORS Origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "All origins"}`);
});
