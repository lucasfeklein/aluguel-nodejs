import express from "express";
import bookRouter from "./routes/book.js";
import copyRouter from "./routes/copy.js";
import personRouter from "./routes/person.js";

const app = express();
const port = 3000;

app.use("/book", bookRouter);
app.use("/person", personRouter);
app.use("/copy", copyRouter);

app.get("/", async (req, res) => {
  res.send("oi");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
