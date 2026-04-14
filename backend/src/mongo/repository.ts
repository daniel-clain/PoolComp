import { MongoClient, type Db } from "mongodb";
import type {
  ActivePoolComp,
  AllData,
  Player,
  PoolComp,
} from "../../../shared/domain.js";
import { poolCompConfig } from "../../../shared/domain.js";

export type Repository = {
  load(): Promise<AllData>;
  save(state: AllData): Promise<void>;
};

export async function connectMongo(
  uri: string,
  dbName: string,
): Promise<{ database: Db; client: MongoClient }> {
  const client = new MongoClient(uri);

  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await client.connect();
      const database = client.db(dbName);
      await database.command({ ping: 1 });
      console.log(`MongoDB connected to "${dbName}".`);
      return { database, client };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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

export function createRepository(database: Db): Repository {
  const playersCollection = database.collection<Player>("Players");
  const activeCompCollection = database.collection<ActivePoolComp>("ActiveComp");
  const compHistoryCollection = database.collection<PoolComp>("CompHistory");

  async function load(): Promise<AllData> {
    const [playerDocuments, activeCompDocument, historyDocuments] = await Promise.all([
      playersCollection.find().toArray(),
      activeCompCollection.findOne(),
      compHistoryCollection.find().sort({ date: -1 }).toArray(),
    ]);

    const players: Player[] = playerDocuments.map((document) => ({
      id: document.id,
      name: document.name,
      deactivated: document.deactivated ?? false,
    }));

    const activePoolComp: ActivePoolComp | null = activeCompDocument
      ? {
          id: activeCompDocument.id,
          date: activeCompDocument.date,
          slots: activeCompDocument.slots,
          registeredPlayers: activeCompDocument.registeredPlayers,
          started: activeCompDocument.started,
        }
      : null;

    const compHistory: PoolComp[] = historyDocuments.map((document) => ({
      id: document.id,
      date: document.date,
      slots: document.slots,
    }));

    return { players, activePoolComp, compHistory, poolCompConfig };
  }

  async function save(state: AllData): Promise<void> {
    await playersCollection.deleteMany({});
    if (state.players.length > 0) {
      await playersCollection.insertMany(state.players);
    }

    await activeCompCollection.deleteMany({});
    if (state.activePoolComp) {
      await activeCompCollection.insertOne(state.activePoolComp);
    }

    await compHistoryCollection.deleteMany({});
    if (state.compHistory.length > 0) {
      await compHistoryCollection.insertMany(state.compHistory);
    }
  }

  return { load, save };
}
