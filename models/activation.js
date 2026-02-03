import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 15; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newActivation = await runInsertQuery(userId, expiresAt);
  return newActivation;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
          user_activate_tokens (user_id, expires_at) 
        VALUES 
          ($1, $2) 
        RETURNING 
          *
        ;`,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function findOneByUserId(userId) {
  const activationFound = await runSelectQuery(userId);
  return activationFound;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
          SELECT 
            * 
          FROM 
            user_activate_tokens 
          WHERE 
            user_id = $1
          LIMIT 
            1
        ;`,
      values: [userId],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activation) {
  await email.send({
    from: "TabGeo <contato@tabgeo.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no TabGeo",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no TabGeo:
${webserver.origin}/cadastro/ativar/${activation.id}

Atenciosamente,
Equipe TabGeo`,
  });
}

const activation = {
  create,
  findOneByUserId,
  sendEmailToUser,
}

export default activation;