import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const person = await prisma.person.findMany();
  res.json(person);
});

export default router;
