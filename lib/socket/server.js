const { Server } = require("socket.io");

let io;
const onlineUsers = new Map();

function getCorsOptions() {
  const rawOrigins = process.env.SOCKET_CORS_ORIGIN || process.env.APP_URL || "";
  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length > 0) {
    return {
      origin: origins.length === 1 ? origins[0] : origins,
      credentials: true,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return { origin: "*" };
  }

  return undefined;
}

// =========================
// HELPERS
// =========================
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

// =========================
// CORE FUNCTIONS
// =========================
function emitToUsers(userIds, eventName, payload) {
  if (!io) return false;

  const targetSocketIds = getSocketIdsForUsers(userIds);
  if (!targetSocketIds.size) return false;

  for (const socketId of targetSocketIds) {
    io.to(socketId).emit(eventName, payload);
  }

  return true;
}

function getIO() {
  return io;
}

function initSocket(server) {
  const socketOptions = {};
  const corsOptions = getCorsOptions();

  if (corsOptions) {
    socketOptions.cors = corsOptions;
  }

  io = new Server(server, socketOptions);

  io.on("connection", (socket) => {

    // =========================
    // USER JOIN
    // =========================
    socket.on("join", (userId) => {
      const normalizedUserId = normalizeId(userId);
      if (!normalizedUserId) return;

      socket.data.userId = normalizedUserId;
      addUserSocket(normalizedUserId, socket.id);

      io.emit("online-users", getOnlineUserIds());
    });

    // =========================
    // NORMAL CHAT MESSAGE
    // =========================
    socket.on("send-message", (data) => {
      const receiverId =
        data?.receiverId?.toString?.() ||
        data?.receiver?.toString?.();

      if (!receiverId) return;

      emitToUsers([receiverId], "receive-message", data);
      emitToUsers([receiverId], "notification", {
        type: "chat",
        text: "New message",
      });
    });

    // =========================
    // 🎫 TICKET MESSAGE
    // =========================
    socket.on("ticket-message", (data) => {
      const { receiverId, ticketId, message } = data;
      const normalizedReceiverId = normalizeId(receiverId);

      if (!normalizedReceiverId) return;

      emitToUsers([normalizedReceiverId], "ticket-message", {
        ticketId,
        message,
      });

      emitToUsers([normalizedReceiverId], "notification", {
        type: "ticket",
        text: "New ticket update",
        ticketId,
      });
    });

    // =========================
    // DISCONNECT
    // =========================
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
    });
  });

  return io;
}

// =========================
// EXPORT (CommonJS)
// =========================
module.exports = {
  initSocket,
  getIO,
  emitToUsers,
};