const mongoose = require('mongoose');

const bloggerSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['blogger', 'admin'], required: true },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blog' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bloggerSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

module.exports = mongoose.model('Blogger', bloggerSchema);
