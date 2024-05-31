const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({ username: String, password: String });
const PostSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, originalLink: String, alternativeCopy: [String] });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username, password }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', userId: user._id });
  });
});

app.post('/submit-link', (req, res) => {
  const { userId, originalLink } = req.body;
  const newPost = new Post({ userId, originalLink, alternativeCopy: [] });
  newPost.save((err, post) => {
    if (err) {
      return res.status(400).json({ message: 'Error creating post' });
    }
    res.json({ message: 'Post created', postId: post._id });
  });
});

app.post('/generate-copy', (req, res) => {
  const { postId, newCopy } = req.body;
  Post.findByIdAndUpdate(postId, { $push: { alternativeCopy: newCopy } }, (err, post) => {
    if (err) {
      return res.status(400).json({ message: 'Error updating post' });
    }
    res.json({ message: 'Copy added' });
  });
});

app.get('/posts/:userId', (req, res) => {
  const { userId } = req.params;
  Post.find({ userId }, (err, posts) => {
    if (err) {
      return res.status(400).json({ message: 'Error fetching posts' });
    }
    res.json(posts);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
