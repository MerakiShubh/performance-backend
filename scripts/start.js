console.log("Start script is running...");

const startFunction = () => {
  console.log("Executing start function...");
  // Add your start logic here
  // For example, a simple periodic task
  setInterval(() => {
    console.log("Start script periodic task running...");
  }, 5000);
};

// Run the start function
startFunction();
