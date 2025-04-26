const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

exports.createPost = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { title, content, coverImage } = req.body;

    if (!title || !content || !coverImage) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newPost = await Post.create({
      title,
      content,
      coverImage,
      author: userId,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    console.error("Get Posts Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("Get Post Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).populate(
      "author",
      "name email"
    );
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Get User's Posts Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this post" });
    }

    await post.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to update this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.coverImage = coverImage || post.coverImage;

    await post.save();

    res
      .status(200)
      .json({ success: true, message: "Post updated successfully", post });
  } catch (err) {
    console.error("Update Post Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
