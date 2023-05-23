const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticateUser, authorizeBloggerOrAdmin } = require('../middlewares/authMiddleware');

router.get('/blogs', blogController.getPublicBlogs);
router.get('/blogs/:author', blogController.getAuthorBlogs);
router.post('/blogs', authenticateUser, authorizeBloggerOrAdmin, blogController.createBlog);
router.put('/blogs/:id', authenticateUser, authorizeBloggerOrAdmin, blogController.updateBlog);
router.delete('/blogs/:id', authenticateUser, authorizeBloggerOrAdmin, blogController.deleteBlog);
router.post('/blogs/:id/like', authenticateUser, blogController.likeBlog);
router.post('/blogs/:id/comment', authenticateUser, blogController.commentOnBlog);
router.post('/blogs/:id/share', authenticateUser, blogController.shareBlog);

module.exports = router;
