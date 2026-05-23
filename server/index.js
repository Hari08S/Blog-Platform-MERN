require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const EmployeeModel = require("./models/employee");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => { console.error("Failed to connect to MongoDB:", err); process.exit(1); });

// Helper: serialize a blog for API response
const serializeBlog = (blog, authorName) => ({
  ...blog.toObject(),
  _id: blog._id.toString(),
  author: blog.author || authorName,
  category: blog.category || "General",
  likes: blog.likes || [],
  comments: (blog.comments || []).map(c => ({ ...c.toObject(), _id: c._id.toString() })),
  views: blog.views || 0,
  image: blog.image && blog.image.data
    ? { data: blog.image.data.toString("base64"), contentType: blog.image.contentType }
    : null,
});

// Setup Admin User with rich content and topic images
const setupAdmin = async () => {
  try {
    const oldAdminEmail = "717823p315@kce.ac.in";
    const adminEmail = "hari1@gmail.com";

    // Delete old admin if exists to clean up reading role views
    await EmployeeModel.deleteOne({ email: oldAdminEmail });

    // Helper to fetch image as buffer from picsum
    const fetchImageAsBuffer = async (seed) => {
      try {
        const url = `https://picsum.photos/seed/${seed}/800/600`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        return {
          data: Buffer.from(arrayBuffer),
          contentType: response.headers.get("content-type") || "image/jpeg"
        };
      } catch (error) {
        console.error(`Failed to fetch image for seed ${seed}:`, error.message);
        return null;
      }
    };

    console.log("Fetching images for default blogs...");
    const blogTemplates = [
      {
        title: "Understanding React: A Complete Guide",
        summary: "Learn the fundamentals of React.js and why it dominates modern frontend development.",
        content: `React is a powerful JavaScript library developed by Facebook for building dynamic user interfaces. Unlike traditional DOM manipulation, React uses a Virtual DOM that compares changes and updates only what is necessary, resulting in blazing-fast performance. At its core, React follows a component-based architecture. Every piece of the UI — a button, a form, a sidebar — is a reusable component. JSX is a syntax extension that lets you write HTML-like code inside JavaScript. This makes your code more readable and easier to debug. Combined with hooks like useState and useEffect, you can build complex stateful logic without writing class components. React powers some of the world's largest applications including Facebook, Instagram, Netflix, Airbnb, and WhatsApp Web.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Technology",
        seed: "react-tech"
      },
      {
        title: "Why Blogging Matters in the Digital Age",
        summary: "Discover how blogging can transform your career, build your brand, and sharpen your thinking.",
        content: `In today's digital world, blogging has evolved from a personal hobby into a powerful professional tool. Whether you are a student, a developer, a designer, or an entrepreneur, maintaining a blog can significantly impact your career trajectory. Writing regularly forces you to organize your thoughts and articulate ideas clearly. When recruiters search for candidates, a well-maintained blog with thoughtful articles immediately sets you apart. It demonstrates initiative, expertise, and communication skills — qualities every employer values.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Lifestyle",
        seed: "lifestyle"
      },
      {
        title: "Wanderlust: Finding Yourself in the Unknown",
        summary: "Explore the transforming power of travel and why stepping out of your comfort zone is essential.",
        content: `Travel is more than just visiting new places; it is an active exploration of the self. Stepping out of your familiar surroundings challenges your assumptions, broadens your perspective, and builds resilience. Whether you are wandering through bustling cities or hiking remote mountain trails, travel exposes you to diverse cultures, languages, and philosophies. These experiences cultivate empathy and help you understand that while we may live differently, our shared human experiences connect us all.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Travel",
        seed: "travel-world"
      },
      {
        title: "The Art of Culinary Fusion: Cooking with Passion",
        summary: "Learn how to blend flavors and techniques from different cultures to create unique culinary masterpieces.",
        content: `Cooking is a form of artistic expression, and culinary fusion is its most exciting boundary. By combining ingredients and techniques from different cultural traditions, you can create dishes that are familiar yet completely new. The key to successful fusion cooking is balance — understanding how sweet, salty, sour, bitter, and umami elements interact. Don't be afraid to experiment; start by adding a local spice to a classic international recipe, and let your taste buds guide you.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Food & Cooking",
        seed: "culinary"
      },
      {
        title: "Mind over Muscle: A Holistic Approach to Fitness",
        summary: "Discover why physical fitness starts with a healthy mindset and how to build habits that last.",
        content: `True fitness is not just about how much weight you can lift or how fast you can run; it is a holistic integration of physical movement, nutrition, and mental well-being. Building a sustainable fitness routine starts with cultivating a positive relationship with your body. Focus on consistency rather than perfection. Find physical activities that you genuinely enjoy, whether it is yoga, weightlifting, swimming, or walking, and nourish your body with wholesome food.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Health & Fitness",
        seed: "fitness-health"
      },
      {
        title: "CSS for Beginners: Styling the Modern Web",
        summary: "Master the fundamentals of CSS and learn how to create beautiful, responsive layouts.",
        content: `CSS (Cascading Style Sheets) is the language that makes the web beautiful. While HTML provides structure and JavaScript adds interactivity, CSS controls the visual presentation — colors, fonts, spacing, layouts, animations, and responsive design. Modern CSS has evolved dramatically. Flexbox and CSS Grid make it easy to create complex, responsive layouts. Understanding responsive design and media queries ensures your website looks beautiful on any device, from a smartphone to a large desktop monitor.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Education",
        seed: "education-learn"
      },
      {
        title: "Innovator's Blueprint: Scaling Ideas to Reality",
        summary: "Key principles for turning your creative concepts into successful, scalable business ventures.",
        content: `Every great business begins with a single idea, but success lies in the execution. Turning a creative concept into a viable business requires a deep understanding of your target market, a clear value proposition, and a scalable business model. Focus on solving a real problem for your customers, build a minimum viable product (MVP) to test your assumptions quickly, and iterate based on real feedback. Remember, scaling requires building systems and teams that can grow alongside your revenue.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Business",
        seed: "business-growth"
      },
      {
        title: "The Evolution of Cinema: From Silver Screen to Streaming",
        summary: "How technology has transformed how we tell stories and consume entertainment.",
        content: `Cinema has always been at the intersection of art and technology. From the silent, black-and-white films of the early 20th century to the CGI-heavy blockbusters of today, the way we tell visual stories has constantly evolved. Today, the rise of streaming platforms has democratized content distribution, giving rise to a golden age of diverse storytelling. While the medium of consumption has shifted from theaters to living rooms, the core human need for compelling narratives remains unchanged.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Entertainment",
        seed: "cinema-movies"
      },
      {
        title: "Cosmic Horizons: What Lies Beyond Our Solar System",
        summary: "An introduction to exoplanets, black holes, and the future of deep space exploration.",
        content: `Astronomy has entered a revolutionary era. With advanced tools like the James Webb Space Telescope, scientists are now able to peer deeper into the cosmos than ever before. We have discovered thousands of exoplanets — worlds orbiting distant stars — some of which lie in the habitable 'Goldilocks' zone. As we continue to study gravitational waves, black holes, and cosmic background radiation, we get closer to answering the fundamental questions of our existence: How did the universe begin, and are we alone?`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "Science",
        seed: "science-space"
      },
      {
        title: "The Power of Mindfulness: Cultivating Daily Peace",
        summary: "Simple mindfulness exercises to reduce stress, improve focus, and bring calm to your busy life.",
        content: `In our fast-paced, always-connected world, our minds are constantly bombarded with information and stimulation. This can lead to chronic stress, anxiety, and mental fatigue. Mindfulness is the practice of bringing your attention back to the present moment without judgment. By taking just five minutes a day to focus on your breath, observe your surroundings, or practice active gratitude, you can significantly reduce stress and improve your overall well-being.`,
        author: "Hari",
        authorEmail: adminEmail,
        category: "General",
        seed: "peace-mind"
      }
    ];

    const blogs = [];
    for (const temp of blogTemplates) {
      const image = await fetchImageAsBuffer(temp.seed);
      blogs.push({
        title: temp.title,
        summary: temp.summary,
        content: temp.content,
        author: temp.author,
        authorEmail: temp.authorEmail,
        category: temp.category,
        image: image
      });
    }

    const existingAdmin = await EmployeeModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.blogs = blogs;
      existingAdmin.username = "Hari";
      existingAdmin.password = "123456";
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log("Admin user blogs updated with rich contents and images!");
    } else {
      await EmployeeModel.create({
        username: "Hari",
        email: adminEmail,
        password: "123456",
        isAdmin: true,
        blogs
      });
      console.log("Admin user created with rich contents and images!");
    }
  } catch (err) {
    console.error("Error setting up admin user:", err);
  }
};
setupAdmin();

// Register User
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "Already registered." });
    const newUser = await EmployeeModel.create({ username, email, password, gender });
    res.json({ success: true, message: "Registration successful", user: newUser });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await EmployeeModel.findOne({ email }).select("+profileImage");
    if (!user || user.password !== password) return res.json({ success: false, message: "Invalid credentials" });
    const userObj = user.toObject();
    userObj.profileImage = user.profileImage?.data
      ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString("base64")}`
      : null;
    res.json({ success: true, message: "Login successful", user: userObj });
  } catch (err) { res.status(500).json({ success: false, message: "Database error: " + err.message }); }
});

// Update User Profile
app.post("/update-user", upload.single("profileImage"), async (req, res) => {
  try {
    const { email, gender, bio } = req.body;
    const profileImage = req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : undefined;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.gender = gender || user.gender;
    if (bio !== undefined) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;
    await user.save();
    const updatedUser = await EmployeeModel.findOne({ email });
    res.json({
      success: true, message: "Profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        profileImage: updatedUser.profileImage?.data
          ? `data:${updatedUser.profileImage.contentType};base64,${updatedUser.profileImage.data.toString("base64")}`
          : null,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: "Failed to update profile: " + err.message }); }
});

// Add a New Blog
app.post("/add-blog", upload.single("image"), async (req, res) => {
  try {
    const { email, title, summary, content, author, category } = req.body;
    const image = req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : null;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const newBlog = { title, summary, content, author, authorEmail: email, category: category || "General", image, createdAt: new Date(), updatedAt: new Date() };
    user.blogs.push(newBlog);
    await user.save();
    const savedBlog = user.blogs[user.blogs.length - 1];
    res.json({ success: true, message: "Blog added", blog: serializeBlog(savedBlog, user.username) });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Get All Blogs (All Users)
app.get("/all-blogs", async (req, res) => {
  try {
    const users = await EmployeeModel.find({}, "username blogs");
    const allBlogs = users.flatMap((user) => user.blogs.map((blog) => serializeBlog(blog, user.username)));
    res.json({ success: true, blogs: allBlogs });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Get Blogs for a Specific User
app.get("/user-blogs", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const blogs = user.blogs.map((blog) => serializeBlog(blog, user.username));
    res.json({ success: true, blogs });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Update a Blog
app.put("/update-blog", upload.single("image"), async (req, res) => {
  try {
    const { email, id, title, summary, content, author, category } = req.body;
    const image = req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : undefined;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const blogIndex = user.blogs.findIndex((b) => b._id.toString() === id);
    if (blogIndex === -1) return res.status(404).json({ success: false, message: "Blog not found" });
    user.blogs[blogIndex] = {
      ...user.blogs[blogIndex].toObject(),
      title, summary, content, author, authorEmail: email,
      category: category || user.blogs[blogIndex].category || "General",
      image: image || user.blogs[blogIndex].image,
      updatedAt: new Date(),
    };
    await user.save();
    res.json({ success: true, message: "Blog updated successfully", blog: serializeBlog(user.blogs[blogIndex], user.username) });
  } catch (err) { res.status(500).json({ success: false, message: "Failed to update blog: " + err.message }); }
});

// Delete a Blog
app.delete("/delete-blog", async (req, res) => {
  try {
    const { email, id } = req.body;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.blogs = user.blogs.filter((b) => b._id.toString() !== id);
    await user.save();
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) { res.status(500).json({ success: false, message: "Failed to delete blog: " + err.message }); }
});

// ==================== SOCIAL FEATURES ====================

// Like / Unlike a Blog
app.post("/like-blog", async (req, res) => {
  try {
    const { likerEmail, authorEmail, blogId } = req.body;
    const user = await EmployeeModel.findOne({ email: authorEmail });
    if (!user) return res.status(404).json({ success: false, message: "Author not found" });
    const blog = user.blogs.id(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    if (!blog.likes) blog.likes = [];
    const idx = blog.likes.indexOf(likerEmail);
    if (idx === -1) { blog.likes.push(likerEmail); } else { blog.likes.splice(idx, 1); }
    await user.save();
    res.json({ success: true, liked: idx === -1, likesCount: blog.likes.length, likes: blog.likes });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Add Comment to a Blog
app.post("/add-comment", async (req, res) => {
  try {
    const { commenterName, commenterEmail, authorEmail, blogId, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    const user = await EmployeeModel.findOne({ email: authorEmail });
    if (!user) return res.status(404).json({ success: false, message: "Author not found" });
    const blog = user.blogs.id(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    if (!blog.comments) blog.comments = [];
    blog.comments.push({ user: commenterName, userEmail: commenterEmail, text: text.trim(), createdAt: new Date() });
    // Create notification for the blog author (only if commenter is not the author)
    if (commenterEmail !== authorEmail) {
      if (!user.notifications) user.notifications = [];
      user.notifications.push({
        type: "comment",
        fromUser: commenterName,
        fromEmail: commenterEmail,
        blogTitle: blog.title,
        blogId: blogId,
        commentText: text.trim().substring(0, 80),
        read: false,
        createdAt: new Date(),
      });
    }
    await user.save();
    const savedComment = blog.comments[blog.comments.length - 1];
    res.json({ success: true, comment: { ...savedComment.toObject(), _id: savedComment._id.toString() } });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Delete Comment from a Blog
app.post("/delete-comment", async (req, res) => {
  try {
    const { requesterEmail, authorEmail, blogId, commentId } = req.body;
    const user = await EmployeeModel.findOne({ email: authorEmail });
    if (!user) return res.status(404).json({ success: false, message: "Author not found" });
    const blog = user.blogs.id(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    // Allow deletion only if requester is the commenter or the blog owner
    if (comment.userEmail !== requesterEmail && authorEmail !== requesterEmail) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }
    blog.comments.pull(commentId);
    await user.save();
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Edit Comment on a Blog
app.post("/edit-comment", async (req, res) => {
  try {
    const { requesterEmail, authorEmail, blogId, commentId, newText } = req.body;
    if (!newText || !newText.trim()) return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    const user = await EmployeeModel.findOne({ email: authorEmail });
    if (!user) return res.status(404).json({ success: false, message: "Author not found" });
    const blog = user.blogs.id(blogId);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    // Only the commenter can edit their own comment
    if (comment.userEmail !== requesterEmail) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this comment" });
    }
    comment.text = newText.trim();
    await user.save();
    res.json({ success: true, message: "Comment updated", comment: { ...comment.toObject(), _id: comment._id.toString() } });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Get Notifications
app.get("/notifications", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const notifications = (user.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ success: true, notifications: notifications.slice(0, 20), unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Mark Notifications as Read
app.post("/mark-notifications-read", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    (user.notifications || []).forEach(n => { n.read = true; });
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Toggle Bookmark
app.post("/toggle-bookmark", async (req, res) => {
  try {
    const { email, blogId } = req.body;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.bookmarks) user.bookmarks = [];
    const idx = user.bookmarks.indexOf(blogId);
    if (idx === -1) { user.bookmarks.push(blogId); } else { user.bookmarks.splice(idx, 1); }
    await user.save();
    res.json({ success: true, bookmarked: idx === -1, bookmarks: user.bookmarks });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Get User Bookmarks
app.get("/user-bookmarks", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, bookmarks: user.bookmarks || [] });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Dashboard Stats
app.get("/dashboard-stats", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const totalBlogs = user.blogs.length;
    const totalLikes = user.blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);
    const totalComments = user.blogs.reduce((sum, b) => sum + (b.comments?.length || 0), 0);
    const totalViews = user.blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    res.json({ success: true, stats: { totalBlogs, totalLikes, totalComments, totalViews, memberSince: user.createdAt } });
  } catch (err) { res.status(500).json({ success: false, message: "Error: " + err.message }); }
});

// Increment blog view
app.post("/view-blog", async (req, res) => {
  try {
    const { authorEmail, blogId } = req.body;
    const user = await EmployeeModel.findOne({ email: authorEmail });
    if (!user) return res.status(404).json({ success: false });
    const blog = user.blogs.id(blogId);
    if (!blog) return res.status(404).json({ success: false });
    blog.views = (blog.views || 0) + 1;
    await user.save();
    res.json({ success: true, views: blog.views });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const http = require("http");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is busy. Attempting to free it...`);
    const { exec } = require("child_process");
    const cmd = process.platform === "win32"
      ? `netstat -ano | findstr :${PORT}`
      : `lsof -ti:${PORT}`;
    exec(cmd, (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split("\n");
        lines.forEach((line) => {
          const parts = line.trim().split(/\s+/);
          const pid = process.platform === "win32" ? parts[parts.length - 1] : line.trim();
          if (pid && /^\d+$/.test(pid)) {
            const killCmd = process.platform === "win32" ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
            exec(killCmd, () => {});
          }
        });
        setTimeout(() => {
          server.listen(PORT, () => console.log(`Server restarted on http://localhost:${PORT}`));
        }, 1500);
      } else {
        setTimeout(() => {
          server.listen(PORT, () => console.log(`Server restarted on http://localhost:${PORT}`));
        }, 1500);
      }
    });
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});