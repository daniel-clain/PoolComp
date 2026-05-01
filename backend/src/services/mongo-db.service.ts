import { MongoClient, type Db } from "mongodb";
import type {
  ActivePoolComp,
  AllData,
  Player,
  PoolComp,
} from "../../../shared/domain.js";

function getMongoConnectionString(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }
  return value;
}


export type Repository = {
  load(): Promise<AllData>;
  ensureIndexes(): Promise<void>;
  insertPlayer(player: Player): Promise<void>;
  replacePlayerByPlayerId(playerId: string, player: Player): Promise<void>;
  insertActivePoolComp(activePoolComp: ActivePoolComp): Promise<void>;
  replaceActivePoolComp(activePoolComp: ActivePoolComp): Promise<void>;
  deleteActivePoolCompById(activePoolCompId: string): Promise<void>;
  insertCompHistoryEntry(poolComp: PoolComp): Promise<void>;
};

export async function createMongoDbService() {

  const database = await connectToDatabase();

  const playersCollection = database.collection<Player>("Players");
  const activeCompCollection =
    database.collection<ActivePoolComp>("ActiveComp");
  const compHistoryCollection = database.collection<PoolComp>("CompHistory");




  return { playersCollection, activeCompCollection, compHistoryCollection, getAllData }

  async function connectToDatabase(): Promise<Db> {
    const client = new MongoClient(getMongoConnectionString());

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

  async function getAllData(): Promise<[Player[], ActivePoolComp | null, PoolComp[]]> {
    const [playerDocuments, activeCompDocument, historyDocuments] =
      await Promise.all([
        playersCollection.find().toArray(),
        activeCompCollection.findOne(),
        compHistoryCollection.find().sort({ date: -1 }).toArray(),
      ]);
    return [playerDocuments, activeCompDocument, historyDocuments];
  }

}
export type MongoDbService = Awaited<ReturnType<typeof createMongoDbService>>;
