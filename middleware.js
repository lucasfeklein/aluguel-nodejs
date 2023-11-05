import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const tokenWithBearer = req.header("Authorization");
  const token = tokenWithBearer.slice(7);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.pin = decoded.pin;
    next();
  });
}

export { verifyToken };
