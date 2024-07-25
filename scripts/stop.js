console.log("Stop script is running...");

const stopFunction = () => {
  console.log("Executing stop function...");
  // Add your stop logic here
  // For example, a simple periodic task
  setInterval(() => {
    console.log("Stop script periodic task running...");
  }, 5000);
};

// Run the stop function
stopFunction();
