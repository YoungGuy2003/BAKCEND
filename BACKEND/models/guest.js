const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
});

