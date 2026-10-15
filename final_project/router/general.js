
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

// Task 6: Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists.'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered.'
  });
});

// Internal data endpoints for the Axios requests in Tasks 10–13
public_users.get('/internal/books', (req, res) => {
  return res.json(books);
});

public_users.get('/internal/books/isbn/:isbn', (req, res) => {
  return res.json(books[req.params.isbn] || null);
});

public_users.get('/internal/books/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const result = Object.values(books).filter(
    book => book.author &&
      book.author.toLowerCase() === author
  );

  return res.json(result);
});

public_users.get('/internal/books/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const result = Object.values(books).filter(
    book => book.title &&
      book.title.toLowerCase() === title
  );

  return res.json(result);
});

// Task 1: Get all books (async/await + Axios)
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      'http://localhost:5000/internal/books'
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books.'
    });
  }
});

// Task 2: Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/books/isbn/${encodeURIComponent(req.params.isbn)}`
    );

    if (!response.data) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve book.'
    });
  }
});

// Task 3: Get books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/books/author/${encodeURIComponent(req.params.author)}`
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by author.'
    });
  }
});

// Task 4: Get books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/internal/books/title/${encodeURIComponent(req.params.title)}`
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by title.'
    });
  }
});

// Task 5: Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.json(book.reviews || {});
});

module.exports.general = public_users;
