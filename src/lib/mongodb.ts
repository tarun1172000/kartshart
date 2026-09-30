import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  let MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  MONGODB_URI = MONGODB_URI.trim();

  // Strip duplicate key prefix if pasted as MONGODB_URI=...
  if (MONGODB_URI.startsWith("MONGODB_URI=")) {
    MONGODB_URI = MONGODB_URI.replace(/^MONGODB_URI=/, "").trim();
  }

  // Auto-correct common missing 'm' typo if pasted as ongodb+srv://
  if (MONGODB_URI.startsWith("ongodb+srv://")) {
    MONGODB_URI = "m" + MONGODB_URI;
  } else if (MONGODB_URI.startsWith("ongodb://")) {
    MONGODB_URI = "m" + MONGODB_URI;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "kartshart",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
