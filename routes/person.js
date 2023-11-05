import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const person = await prisma.person.findUnique({ where: { pin: req.pin } });
  res.json(person);
});

export default router;
