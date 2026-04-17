import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { ActivePoolComp, Player } from "../../../shared/domain.js";
import { createRepository } from "./repository.js";

async function main(): Promise<void> {
  const mongod = await MongoMemoryServer.create();
  const client = new MongoClient(mongod.getUri());
  await client.connect();
  const database = client.db("poolcomp_granular_test");
  const repository = createRepository(database);
  await repository.ensureIndexes();

  const playerA: Player = {
    id: randomUUID(),
    name: "Alice",
    deactivated: false,
  };
  const playerB: Player = {
    id: randomUUID(),
    name: "Bob",
    deactivated: false,
  };

  await repository.insertPlayer(playerA);
  let loaded = await repository.load();
  assert.equal(loaded.players.length, 1);

  await repository.insertPlayer(playerB);
  loaded = await repository.load();
  assert.equal(
    loaded.players.length,
    2,
    "inserting a second player must not remove the first",
  );

  const activePoolComp: ActivePoolComp = {
    id: randomUUID(),
    date: new Date(),
    slots: [],
    registeredPlayers: [],
  };
  await repository.insertActivePoolComp(activePoolComp);
  loaded = await repository.load();
  assert.equal(loaded.players.length, 2);
  assert.ok(loaded.activePoolComp);

  await repository.replaceActivePoolComp({
    ...activePoolComp,
    slots: [{ id: "s1", kind: "empty" }],
  });
  loaded = await repository.load();
  assert.equal(loaded.activePoolComp?.slots.length, 1);

  await repository.insertCompHistoryEntry({
    id: activePoolComp.id,
    date: activePoolComp.date,
    slots: [],
  });
  await repository.deleteActivePoolCompById(activePoolComp.id);
  loaded = await repository.load();
  assert.equal(loaded.activePoolComp, null);
  assert.equal(loaded.compHistory.length, 1);

  await client.close();
  await mongod.stop();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
