import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all succcessful)", () => {
  let createUserResponseBody;

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "rennanpaloschi",
          email: "registration.flow@tabgeo.com.br",
          password: "senha123",
        }),
      }
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "rennanpaloschi",
      email: "registration.flow@tabgeo.com.br",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {

    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await activation.findOneByUserId(createUserResponseBody.id);

    expect(lastEmail.sender).toBe("<contato@tabgeo.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@tabgeo.com.br>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no TabGeo");
    expect(lastEmail.text).toContain("rennanpaloschi");
    expect(lastEmail.text).toContain(activationToken.id);

    console.log(lastEmail.text);
  });

  test("Activate account", async () => {
  });

  test("Login to account", async () => {
  });

});