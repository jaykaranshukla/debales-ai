import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI env var not set");

interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
declare global { var _mongooseCache: MongooseCache; }

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
