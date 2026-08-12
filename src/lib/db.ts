import mongoose from "mongoose";

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
  var _memoryServerUri: string | undefined;
}

async function resolveUri(): Promise<string> {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is not set");
  }

  if (!global._memoryServerUri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create();
    global._memoryServerUri = server.getUri();
    console.log("[db] Using in-memory MongoDB for local development:", global._memoryServerUri);
  }
  return global._memoryServerUri;
}

export async function connectDB() {
  if (!global._mongooseConn) {
    global._mongooseConn = resolveUri().then((uri) =>
      mongoose.connect(uri, { dbName: "financeweb" })
    );
  }
  return global._mongooseConn;
}
