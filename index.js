import cors from "cors";
import express from "express";
import { prisma } from "./prisma.js";
import {
  authRouter,
  bookRouter,
  copyRouter,
  personRouter,
} from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/book", bookRouter);
app.use("/person", personRouter);
app.use("/copy", copyRouter);
app.use("/auth", authRouter);

app.get("/feedbooks", async (req, res) => {
  const books = [
    {
      title: "The Great Gatsby",
      isbn: "9780743273565",
      author: "F. Scott Fitzgerald",
    },
    {
      title: "To Kill a Mockingbird",
      isbn: "9780061120084",
      author: "Harper Lee",
    },
    { title: "1984", isbn: "9780451524935", author: "George Orwell" },
    {
      title: "Pride and Prejudice",
      isbn: "9780141439518",
      author: "Jane Austen",
    },
    {
      title: "The Catcher in the Rye",
      isbn: "9780241950425",
      author: "J.D. Salinger",
    },
    { title: "The Hobbit", isbn: "9780547928227", author: "J.R.R. Tolkien" },
    {
      title: "The Lord of the Rings",
      isbn: "9780544003415",
      author: "J.R.R. Tolkien",
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      isbn: "9780590353427",
      author: "J.K. Rowling",
    },
    {
      title: "The Hunger Games",
      isbn: "9780439023481",
      author: "Suzanne Collins",
    },
    { title: "The Da Vinci Code", isbn: "9780307474278", author: "Dan Brown" },
  ];

  for (const book of books) {
    const createdBook = await prisma.book.create({ data: book });

    for (let i = 0; i < 4; i++) {
      await prisma.copy.create({
        data: {
          bookId: createdBook.id,
          code: Math.random().toString(36).substr(2, 8),
        },
      });
    }
  }
  res.json({ message: "Books and copies added successfully." });
});

app.get("/", async (req, res) => {
  res.send("oi");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
