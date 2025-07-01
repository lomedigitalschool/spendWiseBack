const crypto = require("crypto");

export const tokenGenerator = () => {
  return crypto.randomBytes(32).toString("hex");
};
