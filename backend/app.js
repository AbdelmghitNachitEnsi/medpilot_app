import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import doctorsRoutes from "./routes/doctors.js";
import rendezvousRoutes from "./routes/rendezvous.js";
import http from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';
import client from 'prom-client';
dotenv.config();

console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();
app.use(cors());
app.use(express.json());



// prmotheuse 
// Custom HTTP counter
const httpRequestCounter = new client.Counter({
  name: 'medpilot_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [client.register]  
});

app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    return originalSend.call(this, data);
  };
  next();
});
// 

app.use("/auth", authRoutes);

app.use("/doctors", doctorsRoutes);
app.get("/", (req, res) => res.send("API Running"));


app.use(rendezvousRoutes);

// HTTP server & Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Login
  socket.on("login", (user) => {
    try {
      if (!user?.id) return;
      onlineUsers[user.id] = socket.id;
      console.log("Online Users:", onlineUsers);
    } catch (err) {
      console.error("Login error:", err.message);
    }
  });

  // Chat messages
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", { senderId, text });
    }
  });

  // WebRTC signaling
  socket.on("callUser", ({ from, to, offer }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) io.to(receiverSocket).emit("incomingCall", { from, offer });
  });

  socket.on("answerCall", ({ to, answer }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) io.to(receiverSocket).emit("callAccepted", answer);
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) io.to(receiverSocket).emit("iceCandidate", candidate);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (let key in onlineUsers) {
      if (onlineUsers[key] === socket.id) delete onlineUsers[key];
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

// هاد الجزء: نزيلو الـcomment ونزيلو الـprefix
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();  // بدون prefix – هاد يجيب process_cpu، memory، إلخ بدون medpilot_

// Route Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
});
