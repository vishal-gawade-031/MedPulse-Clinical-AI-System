import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ENV } from "./env";

let mongodInstance: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    // Attempt connecting to the configured MONGODB_URI first
    console.log(`[*] Connecting to MongoDB at ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("[+] Connected to primary MongoDB successfully.");
  } catch (err: any) {
    console.warn(`[!] Primary MongoDB connection failed (${err.message}).`);
    console.log("[*] Initializing embedded MongoMemoryServer for standalone development/demo mode...");

    try {
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[+] Connected to embedded in-memory MongoDB at ${memoryUri}`);
    } catch (memErr: any) {
      console.error("[-] Failed to initialize embedded MongoDB:", memErr);
      throw memErr;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error("[-] Error disconnecting MongoDB:", err);
  }
};
