const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorEmail: { type: String, required: true },
  category: { type: String, default: "General" },
  image: {
    data: Buffer,
    contentType: String,
  },
  likes: [{ type: String }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  type: { type: String, default: "comment" },
  fromUser: { type: String, required: true },
  fromEmail: { type: String, required: true },
  blogTitle: { type: String, required: true },
  blogId: { type: String, required: true },
  commentText: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const EmployeeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, default: "Not specified" },
  bio: { type: String, default: "" },
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  blogs: [BlogSchema],
  bookmarks: [{ type: String }],
  notifications: [NotificationSchema],
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const EmployeeModel = mongoose.model("Employee", EmployeeSchema);
module.exports = EmployeeModel;