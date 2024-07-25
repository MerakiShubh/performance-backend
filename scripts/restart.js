console.log("Restart script is running...");

const restartFunction = () => {
  console.log("Executing restart function...");
  // Add your restart logic here
  // For example, a simple periodic task
  setInterval(() => {
    console.log("Restart script periodic task running...");
  }, 5000);
};

// Run the restart function
restartFunction();
