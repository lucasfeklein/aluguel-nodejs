import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { pin } = req.body;

  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const person = await prisma.person.findUnique({ where: { pin } });

    if (person) {
      const token = jwt.sign({ pin: person.pin }, jwtSecretKey);

      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid pin" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
