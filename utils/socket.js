import { server } from "../server";
import socketIO from "socket.io";
import os from "os-utils";

const io = socketIO(server);

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
        responseTime: Math.random() * 100, // Simulated response time
      };

      io.emit("serverStats", data);
    });
  };

  const intervalId = setInterval(sendStats, 1000);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});
