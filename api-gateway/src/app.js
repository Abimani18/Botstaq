import dotenv from "dotenv";
dotenv.config();  // ⭐ MUST BE FIRST before routes import

import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

console.log("APP.JS → AUTH_SERVICE_URL =", process.env.AUTH_SERVICE_URL);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API Gateway Running" });
});

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);

export default app;
