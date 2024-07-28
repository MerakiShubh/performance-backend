import express from "express";
import pm2 from "pm2";
import { createServer } from "http";
import { Server } from "socket.io";
import osUtils from "os-utils";
import os from "os";
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

const getTotalCpuPercentage = (callback) => {
  const cpusStart = os.cpus();

  setTimeout(() => {
    const cpusEnd = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpusStart.forEach((start, i) => {
      const end = cpusEnd[i].times;

      const idle = end.idle - start.times.idle;
      const total =
        end.user +
        end.nice +
        end.sys +
        end.irq +
        end.idle -
        (start.times.user +
          start.times.nice +
          start.times.sys +
          start.times.irq +
          start.times.idle);

      totalIdle += idle;
      totalTick += total;
    });

    const totalActive = totalTick - totalIdle;
    const totalCpuPercentage = (totalActive / totalTick) * 100;

    const cpuInfo = {
      totalTick: totalTick,
      totalIdle: totalIdle,
      totalActive: totalActive,
      totalCpuPercentage: totalCpuPercentage,
    };

    // console.log(cpuInfo);

    callback(totalCpuPercentage, cpuInfo);
  }, 100);
};

io.on("connection", (socket) => {
  console.log("New client connected");

  const sendStats = () => {
    const memoryUsage = process.memoryUsage();

    getTotalCpuPercentage((totalCpuPercentage, cpuInfo) => {
      osUtils.cpuUsage((cpuPercentage) => {
        const freeMemory = osUtils.freemem();
        const totalMemory = osUtils.totalmem();
        const uptime = osUtils.processUptime();

        const data = {
          currentCpuPercentage: cpuPercentage * 100,
          totalCpuPercentage: totalCpuPercentage,
          memoryUsage: memoryUsage.rss / 1024 / 1024,
          freeMemory: freeMemory * 1024,
          totalMemory: totalMemory * 1024,
          uptime: uptime,
          responseTime: Math.random() * 100,
          totalCPUs: os.cpus().length,
          cpuModel: os.cpus()[0].model,
          cpuSpeed: os.cpus()[0].speed,
          cpuTimes: os.cpus().map((cpu) => cpu.times),
          cpuInfo: cpuInfo,
        };

        // console.log("Emitting data:", data);

        io.emit("serverStats", data);
      });
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
