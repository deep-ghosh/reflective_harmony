import { generateKeys } from "./utils/generateKeys.js";
generateKeys();

import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { app } from "./app.js";

const port = process.env.PORT || 3000;

import { initializeDatabase } from "./db/init.js";


// Initialize Database and Start Server
(async () => {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();
