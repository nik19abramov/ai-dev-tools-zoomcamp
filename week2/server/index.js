import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map(); // roomId -> { code, language }

io.on("connection", (socket) => {
  socket.on("join", ({ roomId }) => {
    socket.join(roomId);
    const state = rooms.get(roomId) || { code: "", language: "javascript" };
    socket.emit("init", state);
  });

  socket.on("code_change", ({ roomId, code }) => {
    const state = rooms.get(roomId) || { code: "", language: "javascript" };
    state.code = code;
    rooms.set(roomId, state);
    socket.to(roomId).emit("code_change", { code });
  });

  socket.on("language_change", ({ roomId, language }) => {
    const state = rooms.get(roomId) || { code: "", language };
    state.language = language;
    rooms.set(roomId, state);
    socket.to(roomId).emit("language_change", { language });
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
