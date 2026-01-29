import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        password: createdUser.password,
        email: createdUser.email,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      // Set cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentSessionToken =
        "6345a698d6f96faecbc1e07fba999f94e836bcc67cf64b719cbf1b2c9752b563b3a776cab534b73a0258954f2cdd852b";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonexistentSessionToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "The user hasn't a valid session.",
        action: "Do login to continue.",
        statusCode: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - (session.EXPIRATION_IN_MILLISECONDS + 1000)),
        toFake: ["Date"],
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const expiredSessionObject = await orchestrator.createSession(
        createdUser.id,
      );

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${expiredSessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "The user hasn't a valid session.",
        action: "Do login to continue.",
        statusCode: 401,
      });
    });

    test("With almost expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS + 1000), // One second to expire
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithAlmostExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithAlmostExpiredSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
