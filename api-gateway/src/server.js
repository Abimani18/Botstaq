import dotenv from "dotenv";
dotenv.config();  // KEEP IT

import app from "./app.js";

const PORT = process.env.PORT || 3000;

console.log("SERVER.JS → AUTH_SERVICE_URL =", process.env.AUTH_SERVICE_URL);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
