import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";
import { findTop3DelayedBooksForMonth } from "../utils.js";

const router = express.Router();

router.get("/myrentals", verifyToken, async (req, res) => {
  const { pin } = req;
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
    include: { copies: { where: { rentedByPin: pin } } },
  });
  res.json(books);
});

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
    include: { copies: true },
  });
  res.json(books);
});

router.get("/top3delayedbooks", async (req, res) => {
  const year = new Date().getFullYear(); // Get the current year
  const result = {};

  for (let month = 1; month <= 12; month++) {
    const top3DelayedBooks = await findTop3DelayedBooksForMonth(year, month);
    result[`${year}-${month}`] = top3DelayedBooks;
  }

  res.json(result);
});

export default router;
