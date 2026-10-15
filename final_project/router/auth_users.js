
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

const users = [];

// Check whether the username is already registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username &&
      user.password === password
  );
};

// Task 7: Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password.'
    });
  }

  const accessToken = jwt.sign(
    { username },
    'access',
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in.'
  });
});

// Task 8: Add or update a review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.query.review ?? req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found.'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Please provide a review.'
    });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully.'
  });
});

// Task 9: Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found.'
    });
  }

  if (
    !books[isbn].reviews ||
    !Object.prototype.hasOwnProperty.call(
      books[isbn].reviews,
      username
    )
  ) {
    return res.status(404).json({
      message: 'No review found for this user.'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully.'
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
