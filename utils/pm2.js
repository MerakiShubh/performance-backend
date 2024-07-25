import pm2 from "pm2";
import { app } from "../server";

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
