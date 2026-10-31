import serverless from "serverless-http";
import app from "./src/index.js";

let handler;
try {
  handler = serverless(app);
} catch (e) {
  console.error("BOOT ERROR", e);
  handler = async (req, res) => {
    res.status(500).json({ error: "boot_error", message: String(e && e.message) });
  };
}

export default async function (req, res) {
  try {
    return await handler(req, res);
  } catch (e) {
    console.error("RUNTIME ERROR", e);
    if (!res.headersSent) res.status(500).json({ error: "runtime_error", message: String(e && e.message) });
  }
}
