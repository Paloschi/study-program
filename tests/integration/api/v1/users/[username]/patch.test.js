import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
        {
          method: "PATCH",
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "The username was not found.",
        action: "verify if the username is correct.",
        statusCode: 404,
      });
    });

    test("With duplicated username", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user1response.status).toBe(201);

      const user2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user2response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "The username is already in use.",
        action: "Try a different username to this operation.",
        statusCode: 400,
      });
    });

    test("With duplicated email", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user1response.status).toBe(201);

      const user2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user2response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/email2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email1@tabgeo.com.br",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "The email is already in use.",
        action: "Try a different email to this operation.",
        statusCode: 400,
      });
    });

    test("With unique username", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueuser1",
          email: "uniqueuser1@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user1response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/uniqueuser1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueuser2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuser2",
        email: "uniqueuser1@tabgeo.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    });

    test("With unique email", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user1response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/uniqueEmail1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail2@tabgeo.com.br",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail1",
        email: "uniqueEmail2@tabgeo.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    });

    test("With new password", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@tabgeo.com.br",
          password: "senha123",
        }),
      });

      expect(user1response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/newPassword1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "newPassword2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPassword1",
        email: "newPassword1@tabgeo.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword1");
      const correctPasswordMatch = await password.compare("newPassword2", userInDatabase.password);
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare("newPassword1", userInDatabase.password);
      expect(incorrectPasswordMatch).toBe(false);

    });
  });
});
