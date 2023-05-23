const Blog = require('../models/blog');
const Blogger = require('../models/blogger');


exports.getPublicBlogs = (req, res) => {
  Blog.find()
    .then((blogs) => {
      res.json({ blogs });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.sendStatus(500);
    });
};

exports.getAuthorBlogs = async (req, res) => {
  const { author } = req.params;

  try {
    const blogs = await Blog.find({ author });

    if (blogs.length === 0) {
      return res.sendStatus(404);
    }

    res.json(blogs);
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
};

exports.createBlog = (req, res) => {
  const { title, content } = req.body;

  const newBlog = new Blog({
    title,
    content,
    author: req.user.username,
    date: new Date(),
  });

  newBlog.save()
    .then((createdBlog) => {
      // Find the blogger and associate the blog with the user
      Blogger.findOne({ username: req.user.username })
        .then((blogger) => {
          if (!blogger) {
            return res.status(404).json({ message: 'Blogger not found' });
          }
          blogger.blogs.push(createdBlog._id);
          blogger.save()
            .then(() => {
              res.status(201).json({ message: 'Blog created successfully' });
            })
            .catch((error) => {
              console.error('Error:', error);
              res.sendStatus(500);
            });
        })
        .catch((error) => {
          console.error('Error:', error);
          res.sendStatus(500);
        });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.sendStatus(500);
    });
};


exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const blog = await Blog.findById(id);

    if (!blog || blog.author !== req.user.username) {
      return res.sendStatus(404);
    }

    blog.title = title;
    blog.content = content;

    await blog.save();

    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findOneAndDelete({ _id: id, author: req.user.username });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find the blogger and remove the deleted blog from the blogs array
    const blogger = await Blogger.findOne({ username: req.user.username });

    if (!blogger) {
      return res.status(404).json({ message: 'Blogger not found' });
    }

    const blogIndex = blogger.blogs.indexOf(id);
    if (blogIndex > -1) {
      blogger.blogs.splice(blogIndex, 1);
    }

    await blogger.save();

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
};

exports.likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });

    if (!blog) {
      return res.sendStatus(404);
    }

    res.json(blog);
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
};

exports.commentOnBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $push: { comments: comment } }, // Add comment to the comments array
      { new: true }
    );

    if (!blog) {
      return res.sendStatus(404);
    }

    res.json(blog);
  } catch (error) {
    console.error('Error:', error);
    res.sendStatus(500);
  }
};

exports.shareBlog = (req, res) => {
  const { id } = req.params;

  Blog.findById(id)
    .then((blog) => {
      if (!blog) {
        return res.sendStatus(404);
      }

      // Allow sharing for all users (including guests)
      blog.shares += 1;
      return blog.save();
    })
    .then(() => {
      res.json({ message: 'Blog shared successfully' });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.sendStatus(500);
    });
};
