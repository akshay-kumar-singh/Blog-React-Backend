const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  deletePost,
  updatePost,
} = require("../controllers/postController");
const authenticate = require("../middleware/auth");

router.post("/", authenticate, createPost);
router.get("/", getAllPosts);
router.get("/my-posts", authenticate, getPostsByUser);
router.get("/:id", getPostById);
router.delete("/:id", authenticate, deletePost);
router.put("/:id", authenticate, updatePost);

module.exports = router;
