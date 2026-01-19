import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/errors.js";

async function create(userImputValues) {
  await validateUniqueEmail(userImputValues.email);
  await validateUniqueUsername(userImputValues.username);

  const newUser = await runInsertQuery(userImputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
        SELECT 
          email 
        FROM 
          users 
        WHERE 
          LOWER(email) = LOWER($1)
      ;`,
      values: [email],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "The email is already in use.",
        action: "Try a different email to register",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `
        SELECT 
          username 
        FROM 
          users 
        WHERE 
          LOWER(username) = LOWER($1)
      ;`,
      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "The username is already in use.",
        action: "Try a different username to register.",
      });
    }
  }

  async function runInsertQuery(userImputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING 
          *
        ;`,
      values: [
        userImputValues.username,
        userImputValues.email,
        userImputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
          * 
        FROM 
          users 
        WHERE 
          lower(username) = lower($1)
        LIMIT 
          1
      ;`,
      values: [username],
    });

    if (results.rowCount == 0) {
      throw new NotFoundError({
        message: "The username was not found.",
        action: "verify if the username is correct.",
      });
    }

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
