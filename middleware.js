import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

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

async function checkLateReturns(req, res, next) {
  const pin = req.pin;

  const rentalHistory = await prisma.rentalHistory.findMany({
    where: {
      rentedByPin: pin,
      returnedAt: {
        not: null,
      },
    },
  });

  const lateReturns = rentalHistory.filter((rental) => {
    const { rentedAt, returnedAt } = rental;
    const differenceInDays = (returnedAt - rentedAt) / (1000 * 60 * 60 * 24);
    return differenceInDays > 14;
  });

  if (lateReturns.length >= 2) {
    return res.status(400).json({
      error: "You are not eligible to rent due to multiple late returns.",
    });
  }

  next();
}

export { checkLateReturns, verifyToken };
