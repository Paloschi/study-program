import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcrypt.hash(password, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPasswordHash) {
  return await bcrypt.compare(providedPassword, storedPasswordHash);
}

const password = {
  hash,
  compare,
}

export default password;