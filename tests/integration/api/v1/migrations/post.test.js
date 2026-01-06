import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

test("POST to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const responseBody = await response.json();

  const numberOfMigrationsToApply = responseBody.length;

  const countAppliedMigrations = await database.query(
    "select count(*) as n_migrations from pgmigrations;"
  );
  const numberOfAppliedMigrations = parseInt(
    countAppliedMigrations.rows[0].n_migrations
  );

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
  expect(numberOfAppliedMigrations).toBe(numberOfMigrationsToApply);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const responseBody2 = await response2.json();
  expect(Array.isArray(responseBody2)).toBe(true);

  const numberOfMigrationsRemaining = responseBody2.length;
  expect(numberOfMigrationsRemaining).toBe(0);
});
