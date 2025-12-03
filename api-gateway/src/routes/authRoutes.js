import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

console.log("AUTHROUTES → AUTH_SERVICE_URL =", process.env.AUTH_SERVICE_URL);

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" }
  })
);

// ⭐ EXPORT DEFAULT MUST BE HERE
export default router;
