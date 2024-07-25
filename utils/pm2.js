import pm2 from "pm2";
import { app } from "../server";

pm2.connect((err) => {
  if (err) {
    console.error("Pm2 error: ", err);
    process.exit(2);
  }

  app.get("/start/:name", (req, res) => {
    const script = req.params.name;
    pm2.start(script, (err, apps) => {
      if (err) return res.status(500).send(err);
      res.send(`Started ${script}`);
    });
  });

  app.get("/stop/:name", (req, res) => {
    const script = req.params.name;
    pm2.stop(script, (err, apps) => {
      if (err) return res.status(500).send(err);
      res.send(`Stopped ${script}`);
    });
  });

  app.get("/restart/:name", (req, res) => {
    const script = req.params.name;
    pm2.restart(script, (err, apps) => {
      if (err) return res.status(500).send(err);
      res.send(`Restarted ${script}`);
    });
  });

  // Graceful PM2 disconnect on server shutdown
  process.on("SIGINT", () => {
    pm2.disconnect();
    process.exit(0);
  });
});
