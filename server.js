import express from "express";
import pm2 from "pm2";
import { createServer } from "http";
import { Server } from "socket.io";
import os from "os-utils";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import pm2Routes from "./routes/pm2Routes.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log("Here is origin", process.env.CORS_ORIGIN);

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use("/api/pm2", pm2Routes);

pm2.connect((err) => {
  if (err) {
    console.error("PM2 connection error: ", err);
    process.exit(2);
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  const sendStats = () => {
    const memoryUsage = process.memoryUsage();
    os.cpuUsage((cpuPercentage) => {
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();
      const uptime = os.processUptime();

      const data = {
        cpuPercentage: cpuPercentage * 100,
        memoryUsage: memoryUsage.rss / 1024 / 1024,
        freeMemory: freeMemory / 1024,
        totalMemory: totalMemory / 1024,
        uptime: uptime,
        responseTime: Math.random() * 100,
      };

      console.log("Emitting data:", data); // Add this line for debugging

      io.emit("serverStats", data);
    });
  };

  const intervalId = setInterval(sendStats, 1000);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
