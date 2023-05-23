const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blogger = require('../models/blogger');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Secret key for JWT
const secretKey = '123456';


exports.login = (req, res) => {
  const { username, password } = req.body;

  // Find the user model based on the role
  const userModel = getUserModelByRole('blogger');

  if (!userModel) {
    return res.sendStatus(400);
  }

  if (username.toLowerCase() === 'guest') {
    // Guest user login
    const tokenPayload = { username, role: 'guest', uniqueId: uuidv4() };
    const token = jwt.sign(tokenPayload, secretKey);
    return res.json({ token });
  }

  userModel.findOne({ username })
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        // If the user is not found or password is incorrect, return unauthorized
        return res.sendStatus(401);
      }

      const token = jwt.sign({ id: user._id, username: user.username, role: 'blogger' }, secretKey);

      res.json({ token });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.sendStatus(500);
    });
};


exports.signup = (req, res) => {
  const { username, password, role } = req.body;

  // Find the user model based on the role
  const userModel = getUserModelByRole('blogger');

  if (!userModel) {
    return res.sendStatus(400);
  }

  userModel.findOne({ username })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      let hashedPassword;

      if (role === 'admin') {
        // Check if the password is valid for admin role
        if (password !== 'administhebest') {
          return res.status(400).json({ message: 'Invalid password for admin' });
        }
        hashedPassword = bcrypt.hashSync(password, 10);
      } else {
        hashedPassword = bcrypt.hashSync(password, 10);
      }

      const user = new userModel({
        username,
        password: hashedPassword,
        role,
      });
      
      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: 'User created successfully' });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.sendStatus(500);
    });
};
exports.logout = (req, res) => {
  // Simply return a success message for logout
  res.json({ message: 'Logout successful' });
};

// Helper function to get user model based on role
function getUserModelByRole(role) {
  let userModel;
  switch (role) {
    case 'blogger':
      userModel = Blogger;
      break;
    default:
      userModel = null;
  }
  return userModel;
}
