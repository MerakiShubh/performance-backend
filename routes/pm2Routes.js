import express from "express";
import pm2 from "pm2";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const scriptPath = process.env.SCRIPT_PATH;

router.get("/start/:name", async (req, res) => {
  const script = `${scriptPath}/${req.params.name}.js`;
  console.log(`Attempting to start script: ${script}`);

  pm2.describe(req.params.name, (err, processDescription) => {
    if (err) {
      console.error(`Error describing process ${req.params.name}: `, err);
      return res
        .status(500)
        .send({ error: "Error describing process", details: err });
    }

    if (processDescription && processDescription.length > 0) {
      console.log(`Script ${script} is already running`);
      return res.status(400).send({ error: "Script already running" });
    }

    pm2.start(script, { name: req.params.name }, (err, apps) => {
      if (err) {
        console.error(`Error starting script ${script}: `, err);
        return res
          .status(500)
          .send({ error: "Error starting script", details: err });
      }
      console.log(`Started script ${script}: `, apps);
      res.send({ message: `Started ${script}` });
    });
  });
});

router.get("/stop/:name", (req, res) => {
  const scriptName = req.params.name;
  console.log(`Attempting to stop script: ${scriptName}`);

  pm2.list((err, processList) => {
    if (err) {
      console.error("Error retrieving process list: ", err);
      return res.status(500).send(err);
    }

    console.log("Current running processes: ", processList);

    const process = processList.find((p) => p.name === scriptName);
    if (!process) {
      const errorMessage = `Process with name ${scriptName} not found.`;
      console.error(errorMessage);
      return res.status(404).send(errorMessage);
    }

    pm2.stop(scriptName, (err, apps) => {
      if (err) {
        console.error(`Error stopping script ${scriptName}: `, err);
        return res.status(500).send(err);
      }
      console.log(`Stopped script ${scriptName}: `, apps);
      res.send(`Stopped ${scriptName}`);
    });
  });
});

router.get("/restart/:name", (req, res) => {
  const script = `${scriptPath}/${req.params.name}.js`;
  console.log(`Attempting to restart script: ${script}`);
  pm2.restart(script, (err, apps) => {
    if (err) {
      console.error(`Error restarting script ${script}: `, err);
      return res.status(500).send(err);
    }
    console.log(`Restarted script ${script}: `, apps);
    res.send(`Restarted ${script}`);
  });
});

router.get("/status/:name", (req, res) => {
  pm2.describe(req.params.name, (err, processDescription) => {
    if (err) {
      console.error(`Error describing process ${req.params.name}: `, err);
      return res.status(500).send(err);
    }

    if (processDescription && processDescription.length > 0) {
      res.send(processDescription);
    } else {
      res.status(404).send({ message: "Script not found" });
    }
  });
});

export default router;
