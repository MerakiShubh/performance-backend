import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
dotenv.config();
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Authorization,Content-Type",
  })
);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running of port: ${PORT}`);
});

export { app, server };
