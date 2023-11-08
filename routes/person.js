import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const person = await prisma.person.findUnique({ where: { pin: req.pin } });
  res.json(person);
});

router.post("/register", async (req, res) => {
  const { name, pin, address, birthday } = req.body;

  const person = await prisma.person.create({
    data: { name, pin, address, birthday },
  });

  res.json(person);
});

export default router;
