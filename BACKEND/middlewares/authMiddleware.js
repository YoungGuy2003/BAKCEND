const jwt = require('jsonwebtoken');
const Blogger = require('../models/blogger');

const secretKey = '123456';

exports.authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  next();
};

exports.authorizeBlogger = (req, res, next) => {
  if (req.user.role !== 'blogger') {
    return res.sendStatus(403);
  }

  next();
};

exports.authorizeBloggerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'blogger' && req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  next();
};
exports.authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, it could be a guest user
    req.user = { username: 'guest', role: 'guest' };
    return next();
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

