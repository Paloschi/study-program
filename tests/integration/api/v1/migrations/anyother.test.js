import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

test("ANYOTHER to /api/v1/migrations should return 405", async () => {
  const othermethods = ["PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];

  for (const method of othermethods) {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: method,
    });

    // console.log("Status: " + response.status);
    // console.log("Error: " + (await response.json()).error);

    expect(response.status).toBe(405);
  }
});
