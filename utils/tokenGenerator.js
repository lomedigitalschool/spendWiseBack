const crypto = require("crypto");

const tokenGenerator = () => {
  return crypto.randomBytes(32).toString("hex");
};
module.exports = { tokenGenerator };