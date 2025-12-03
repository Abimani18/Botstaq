import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

console.log("EMAILROUTES → EMAIL_SERVICE_URL =", process.env.EMAIL_SERVICE_URL);

const router = express.Router();

router.use(
  "/",
  createProxyMiddleware({
    target: process.env.EMAIL_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/email": "" }
  })
);

export default router;
