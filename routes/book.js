import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/books", async (req, res) => {
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
    include: { copies: true },
  });
  res.json(books);
});

export default router;
