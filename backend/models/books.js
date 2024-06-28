const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  img: { type: String,required: true },
  createdAt: { type: Date, default: Date.now },
});

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;
