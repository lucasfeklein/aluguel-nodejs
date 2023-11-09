import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

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

function calculateDelayInDays(rentedAt, returnedAt) {
  if (!rentedAt || !returnedAt) {
    return 0;
  }
  const delayInMilliseconds = returnedAt - rentedAt;
  return delayInMilliseconds / (1000 * 60 * 60 * 24);
}

async function findTop3DelayedBooksForMonth(year, month) {
  const rentalHistory = await prisma.rentalHistory.findMany({
    where: {
      AND: [
        {
          rentedAt: {
            gte: new Date(year, month - 1, 1),
          },
        },
        {
          rentedAt: {
            lt: new Date(year, month, 1),
          },
        },
        {
          returnedAt: {
            not: null,
          },
        },
      ],
    },
    include: {
      copy: {
        include: {
          book: true,
        },
      },
    },
  });

  const delayedBooks = {};

  rentalHistory.forEach((rental) => {
    const bookTitle = rental.copy.book.title;
    const delayInDays = calculateDelayInDays(
      rental.rentedAt,
      rental.returnedAt
    );

    if (delayInDays > 14) {
      // Consider only books returned after 14 days as late
      if (!delayedBooks[bookTitle]) {
        delayedBooks[bookTitle] = { totalDelay: 0, count: 0 };
      }

      delayedBooks[bookTitle].totalDelay += delayInDays;
      delayedBooks[bookTitle].count += 1;
    }
  });

  const averagedDelayedBooks = Object.entries(delayedBooks).map(
    ([bookTitle, { totalDelay, count }]) => ({
      bookTitle,
      averageDelay: totalDelay / count,
    })
  );

  const top3DelayedBooks = averagedDelayedBooks
    .sort((a, b) => b.averageDelay - a.averageDelay)
    .slice(0, 3);

  return top3DelayedBooks;
}

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
