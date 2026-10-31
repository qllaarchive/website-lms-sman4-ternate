export default function handler(req, res) {
  res.status(200).json({
    hasDb: !!process.env.DATABASE_URL,
    hasJwt: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    hasAdmin: !!process.env.ADMIN_USER,
  });
}
