import express from "express";
import pm2Routes from "./pm2Routes.js"; // Use the correct file extension

const router = express.Router();

router.use("/pm2", pm2Routes);

export default router;
