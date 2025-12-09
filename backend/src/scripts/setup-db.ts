import dotenv from "dotenv";
dotenv.config();

import { initializeDatabase } from "../db/init.js";

async function setup_database() {
  try {
    console.log("=== Database Setup ===\n");

    // Initialize database tables
    await initializeDatabase();

    console.log("\n=== Setup Complete ===");
    process.exit(0);
  } catch (error) {
    console.error("\n=== Setup Failed ===");
    console.error(error);
    process.exit(1);
  }
}

// Call the setup function
setup_database();
