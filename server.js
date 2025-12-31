
import mongoose from "mongoose";
import app from "./app.js";

const Port = process.env.PORT || 5010;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(Port, () => {
      console.log(`listening on port ${Port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
}

if (process.env.NODE_ENV !== "test") {
  start();
}

export { start };
