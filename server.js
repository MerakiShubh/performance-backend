import express from "express";

const app = express();

const server = app.listen(8000, () => {
  console.log("Server is running ");
});

export { app, server };
