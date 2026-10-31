export default function handler(req, res) {
  res.status(200).json({ hasDb: !!process.env.DATABASE_URL, nodeEnv: process.env.NODE_ENV });
}
