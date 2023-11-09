import { prisma } from "./prisma.js";

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

export { calculateDelayInDays, findTop3DelayedBooksForMonth };
