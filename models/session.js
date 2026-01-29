import crypto from "crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
          sessions (token, user_id, expires_at) 
        VALUES 
          ($1, $2, $3) 
        RETURNING 
          *
        ;
      `,
      values: [token, userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function findOneValidByToken(token) {
  const sessionObject = await runSelectQuery(token);
  return sessionObject;

  async function runSelectQuery(token, now = new Date()) {
    const results = await database.query({
      text: `
        SELECT 
          * 
        FROM 
          sessions 
        WHERE 
          token = $1
        AND 
          expires_at > $2
        LIMIT 1
      ;`,
      values: [token, now],
    });
    if (results.rowCount == 0) {
      throw new UnauthorizedError({
        message: "The user hasn't a valid session.",
        action: "Do login to continue.",
      });
    }
    return results.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE 
          sessions 
        SET 
          expires_at = $2,
          updated_at = timezone('utc', now())
        WHERE 
          id = $1
        RETURNING 
          *
        ;
      `,
      values: [sessionId, expiresAt],
    });
    return results.rows[0];
  }
}

async function expireById(sessionId) {
  const expiredSession = await runDeleteQuery(sessionId);
  return expiredSession;

  async function runDeleteQuery(sessionId) {
    const results = await database.query({
      text: `
        UPDATE 
          sessions 
        SET 
          expires_at = expires_at - interval '1 year',
          updated_at = timezone('utc', now())
        WHERE 
          id = $1
        RETURNING 
          *;
      `,
      values: [sessionId],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
