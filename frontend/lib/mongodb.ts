import mongoose from "mongoose";

/* ----------------------------------------------------------------------------
   Cached mongoose connection. Next.js dev hot-reloads modules, so we stash the
   connection on `global` to avoid opening a new pool on every request.
---------------------------------------------------------------------------- */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lumiere";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = global as unknown as { _mongoose?: Cache };
const cached: Cache = globalForMongoose._mongoose || { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
