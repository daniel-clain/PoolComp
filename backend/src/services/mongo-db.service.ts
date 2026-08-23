import { MongoClient, type Db, type FindOneAndUpdateOptions } from "mongodb";
import type {
  Player,
  PoolComp_D
} from "../../../shared/domain.js";

export const updateOptions: FindOneAndUpdateOptions = {
  returnDocument: "after",
  projection: { _id: 0 },
};

export async function createMongoDbService() {

  const database = await connectToDatabase();

  const playersCollection = database.collection<Player>("Players");
  const activeCompCollection =
    database.collection<PoolComp_D>("ActiveComp");
  const compHistoryCollection = database.collection<PoolComp_D>("CompHistory");




  return { playersCollection, activeCompCollection, compHistoryCollection, getAllData, getAllHistoryData }

  async function connectToDatabase(): Promise<Db> {
    const mongoConnectionString = process.env.MONGODB_URI;
    if (mongoConnectionString === undefined) {
      throw new Error("Missing required environment variable: MONGODB_URI");
    }
    const client = new MongoClient(mongoConnectionString);

    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await client.connect();
        const database = client.db("PoolComp");
        await database.command({ ping: 1 });
        console.log(`MongoDB connected`);
        return database
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${errorMessage}`,
        );
        if (attempt === MAX_RETRIES) throw error;
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error("MongoDB connection failed after all retries.");
  }

  async function getAllData(): Promise<[Player[], PoolComp_D | null, PoolComp_D[]]> {
    const [playerDocuments, activeCompDocument, historyDocuments] =
      await Promise.all([
        playersCollection.find({}, { projection: { _id: 0 } }).toArray(),
        activeCompCollection.findOne({}, { projection: { _id: 0 } }),
        compHistoryCollection.find({}, { projection: { _id: 0 } }).sort({ date: -1 }).limit(5).toArray(),
      ]);
    return [playerDocuments, activeCompDocument, historyDocuments];
  }

  async function getAllHistoryData(): Promise<PoolComp_D[]> {
    return compHistoryCollection.find({}, { projection: { _id: 0 } }).sort({ date: -1 }).toArray();
  }



}
export type MongoDbService = Awaited<ReturnType<typeof createMongoDbService>>;
