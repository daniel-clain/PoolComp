import { Collection, MongoClient, type Db } from "mongodb";
import type {
  ActivePoolComp,
  AllData,
  Player,
  PoolComp,
} from "../../../shared/domain.js";
import { poolCompConfig } from "../../../shared/domain.js";
import { serverConfig } from "../config.js";

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

export async function createMongoDbService(): Promise<{ playersCollection: Collection<Player>; activeCompCollection: Collection<ActivePoolComp>; compHistoryCollection: Collection<PoolComp> }> {

  const database = await connectToDatabase();
  
  const playersCollection = database.collection<Player>("Players");
  const activeCompCollection =
    database.collection<ActivePoolComp>("ActiveComp");
  const compHistoryCollection = database.collection<PoolComp>("CompHistory");

  

  return { playersCollection, activeCompCollection, compHistoryCollection}
  
  async function connectToDatabase(): Promise<Db> {
    const client = new MongoClient(serverConfig.mongoUri);
  
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 1000;
  
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await client.connect();
        const database = client.db(serverConfig.mongoDbName);
        await database.command({ ping: 1 });
        console.log(`MongoDB connected to "${serverConfig.mongoDbName}".`);
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
  
}
export type MongoDbService = Awaited<ReturnType<typeof createMongoDbService>>;

/* export function createRepository(database: Db): Repository {
  
async function load(): Promise<AllData> {
    const [playerDocuments, activeCompDocument, historyDocuments] =
      await Promise.all([
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
        }
      : null;

    const compHistory: PoolComp[] = historyDocuments.map((document) => ({
      id: document.id,
      date: document.date,
      slots: document.slots,
    }));

    return { players, activePoolComp, compHistory};
  }
  async function ensureIndexes(): Promise<void> {
    await playersCollection.createIndex({ id: 1 }, { unique: true });
    await activeCompCollection.createIndex({ id: 1 }, { unique: true });
    await compHistoryCollection.createIndex({ id: 1 }, { unique: true });
  }

  async function insertPlayer(player: Player): Promise<void> {
    await playersCollection.insertOne(player);
  }

  async function replacePlayerByPlayerId(
    playerId: string,
    player: Player,
  ): Promise<void> {
    const result = await playersCollection.replaceOne({ id: playerId }, player);
    if (result.matchedCount === 0) {
      throw new Error("Player not found.");
    }
  }

  async function insertActivePoolComp(
    activePoolComp: ActivePoolComp,
  ): Promise<void> {
    const count = await activeCompCollection.countDocuments();
    if (count > 0) {
      throw new Error("An active comp already exists in the database.");
    }
    await activeCompCollection.insertOne(activePoolComp);
  }

  async function replaceActivePoolComp(
    activePoolComp: ActivePoolComp,
  ): Promise<void> {
    const result = await activeCompCollection.replaceOne(
      { id: activePoolComp.id },
      activePoolComp,
    );
    if (result.matchedCount === 0) {
      throw new Error("Active comp not found.");
    }
  }

  async function deleteActivePoolCompById(
    activePoolCompId: string,
  ): Promise<void> {
    const result = await activeCompCollection.deleteOne({
      id: activePoolCompId,
    });
    if (result.deletedCount === 0) {
      throw new Error("Active comp not found.");
    }
  }

  async function insertCompHistoryEntry(poolComp: PoolComp): Promise<void> {
    await compHistoryCollection.insertOne(poolComp);
  }

  return {
    load,
    ensureIndexes,
    insertPlayer,
    replacePlayerByPlayerId,
    insertActivePoolComp,
    replaceActivePoolComp,
    deleteActivePoolCompById,
    insertCompHistoryEntry,
  };
} */
