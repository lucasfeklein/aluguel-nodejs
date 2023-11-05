import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany();
  res.json(books);
});

export default router;