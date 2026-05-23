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

// Setup Admin User with rich content
const setupAdmin = async () => {
  try {
    const adminEmail = "717823p315@kce.ac.in";

    const blogs = [
      {
        title: "Understanding React: A Complete Guide",
        summary: "Learn the fundamentals of React.js and why it dominates modern frontend development.",
        content: `React is a powerful JavaScript library developed by Facebook for building dynamic user interfaces. Unlike traditional DOM manipulation, React uses a Virtual DOM that compares changes and updates only what is necessary, resulting in blazing-fast performance.

At its core, React follows a component-based architecture. Every piece of the UI — a button, a form, a sidebar — is a reusable component. Components accept inputs called "props" and manage their own internal "state". When state changes, React automatically re-renders the component.

One of React's greatest strengths is JSX, a syntax extension that lets you write HTML-like code inside JavaScript. This makes your code more readable and easier to debug. Combined with hooks like useState and useEffect, you can build complex stateful logic without writing class components.

React also has a massive ecosystem. React Router handles client-side navigation, Redux and Context API manage global state, and tools like Next.js enable server-side rendering. Whether you are building a simple portfolio or a complex enterprise dashboard, React scales beautifully.

Today, React powers some of the world's largest applications including Facebook, Instagram, Netflix, Airbnb, and WhatsApp Web. Its component reusability, strong community, and continuous improvements make it the top choice for frontend developers worldwide.`,
        author: "John Doe",
        authorEmail: adminEmail,
        category: "Technology",
      },
      {
        title: "Why Blogging Matters in the Digital Age",
        summary: "Discover how blogging can transform your career, build your brand, and sharpen your thinking.",
        content: `In today's digital world, blogging has evolved from a personal hobby into a powerful professional tool. Whether you are a student, a developer, a designer, or an entrepreneur, maintaining a blog can significantly impact your career trajectory.

Writing regularly forces you to organize your thoughts and articulate ideas clearly. When you explain a concept in writing, you deepen your own understanding of it. This is why many top engineers and designers maintain technical blogs — it is both a learning tool and a portfolio piece.

Blogging also builds your personal brand. When recruiters search for candidates, a well-maintained blog with thoughtful articles immediately sets you apart. It demonstrates initiative, expertise, and communication skills — qualities every employer values. A single viral blog post can open doors to job offers, speaking invitations, and consulting opportunities.

From an SEO perspective, consistent blogging drives organic traffic. Each blog post is a new indexed page that can rank in search results, bringing visitors to your site for months or even years. For businesses, this translates directly into leads and revenue.

The beauty of blogging is that anyone can start with zero investment. Platforms like Medium, Dev.to, Hashnode, and WordPress make it easy to publish your first post today. The key is consistency — write regularly, share your unique perspective, and engage with your readers.

Remember: every expert was once a beginner. Your first post does not need to be perfect. It just needs to exist. Start writing, and let your blog grow with you.`,
        author: "Jane Smith",
        authorEmail: adminEmail,
        category: "Lifestyle",
      },
      {
        title: "The Power of JavaScript: From Browser to Server",
        summary: "Explore why JavaScript is the world's most versatile programming language.",
        content: `JavaScript was born in 1995 as a simple scripting language for web browsers. Today, it is the most widely used programming language in the world, powering everything from interactive websites to mobile apps, desktop applications, and even machine learning models.

On the frontend, JavaScript frameworks like React, Vue, and Angular have revolutionized how we build user interfaces. They enable Single Page Applications (SPAs) that feel as fast and responsive as native desktop software. Features like real-time updates, animations, and drag-and-drop interfaces are all powered by JavaScript.

The introduction of Node.js in 2009 was a game-changer. It brought JavaScript to the server side, enabling developers to use one language for both frontend and backend. This "full-stack JavaScript" approach simplified development, reduced context-switching, and made it possible for a single developer to build entire applications.

JavaScript's package ecosystem, npm, is the largest software registry in the world with over 2 million packages. Whether you need a date formatting library, a database ORM, or a machine learning toolkit, npm has it. This rich ecosystem means you rarely need to build things from scratch.

Modern JavaScript (ES6+) introduced powerful features like arrow functions, destructuring, template literals, async/await, and modules. These features make the code cleaner, more readable, and easier to maintain. Combined with TypeScript for type safety, JavaScript has matured into a robust, enterprise-grade language.

From frontend to backend, from mobile (React Native) to desktop (Electron), JavaScript truly runs everywhere. Learning JavaScript is not just learning a language — it is gaining access to the entire spectrum of software development.`,
        author: "Alice Johnson",
        authorEmail: adminEmail,
        category: "Technology",
      },
      {
        title: "CSS for Beginners: Styling the Modern Web",
        summary: "Master the fundamentals of CSS and learn how to create beautiful, responsive layouts.",
        content: `CSS (Cascading Style Sheets) is the language that makes the web beautiful. While HTML provides structure and JavaScript adds interactivity, CSS controls the visual presentation — colors, fonts, spacing, layouts, animations, and responsive design.

The "cascading" in CSS refers to how styles are applied in a priority order. Styles can come from browser defaults, external stylesheets, internal styles, or inline styles. Understanding specificity and the cascade is fundamental to writing predictable CSS.

Modern CSS has evolved dramatically. Flexbox and CSS Grid have replaced the old float-based layouts, making it easy to create complex, responsive designs. Flexbox excels at one-dimensional layouts (rows or columns), while Grid handles two-dimensional layouts (rows AND columns simultaneously).

CSS Custom Properties (variables) allow you to define reusable values like colors and spacing. Combined with the calc() function, you can create dynamic, mathematical relationships between values. This makes maintaining large stylesheets much easier.

CSS animations and transitions bring websites to life. A simple hover effect can transform a static button into an interactive element. Keyframe animations enable complex sequences — loading spinners, page transitions, and scroll-triggered effects that delight users.

Responsive design is no longer optional. With CSS media queries, your layouts adapt to any screen size — from a 4-inch phone to a 32-inch monitor. The mobile-first approach, where you design for small screens first and enhance for larger ones, has become the industry standard.

Tools like CSS preprocessors (Sass, Less), utility frameworks (Tailwind), and component libraries (Bootstrap) extend CSS's capabilities. But understanding vanilla CSS is essential — it is the foundation everything else is built upon.`,
        author: "Bob Williams",
        authorEmail: adminEmail,
        category: "Education",
      },
      {
        title: "Mastering Node.js: Backend Development with JavaScript",
        summary: "Learn how Node.js enables fast, scalable server-side applications.",
        content: `Node.js transformed JavaScript from a browser-only language into a full-stack powerhouse. Built on Chrome's V8 engine, Node.js executes JavaScript on the server with exceptional speed and efficiency.

The key innovation of Node.js is its event-driven, non-blocking I/O model. Traditional server platforms like PHP or Java create a new thread for each client request, which consumes memory and limits scalability. Node.js, on the other hand, uses a single-threaded event loop that handles thousands of concurrent connections without the overhead of thread management.

This architecture makes Node.js ideal for real-time applications. Chat applications, live notifications, collaborative editing tools, and streaming services all benefit from Node.js's ability to handle many simultaneous connections with low latency.

Express.js is the most popular Node.js framework, providing a minimalist foundation for building web servers and APIs. With Express, you can set up routes, middleware, and error handling in just a few lines of code. Other frameworks like Fastify, Koa, and NestJS offer alternative approaches with different tradeoffs.

Node.js's package manager, npm, gives you access to millions of ready-to-use modules. Need a database driver? Authentication middleware? Email service? There is a well-maintained npm package for almost anything.

MongoDB paired with Mongoose is a popular database choice for Node.js applications. The MERN stack (MongoDB, Express, React, Node.js) has become one of the most widely adopted full-stack combinations, offering a consistent JavaScript experience from database to user interface.

Companies like Netflix, Uber, PayPal, LinkedIn, and NASA use Node.js in production. PayPal reported a 35% decrease in response time and double the number of requests per second after switching from Java to Node.js.`,
        author: "Charlie Davis",
        authorEmail: adminEmail,
        category: "Technology",
      },
      {
        title: "The Importance of UX/UI Design in Product Success",
        summary: "How thoughtful design directly impacts user satisfaction and business outcomes.",
        content: `User Experience (UX) and User Interface (UI) design are not just about making things look pretty — they are strategic business tools that directly impact revenue, retention, and brand perception. A well-designed product can be the difference between a startup's success and failure.

UX design focuses on the overall experience a user has with a product. It involves research, user personas, journey mapping, wireframing, and usability testing. The goal is to understand users' needs, pain points, and behaviors, then design solutions that are intuitive and efficient.

UI design, on the other hand, focuses on the visual and interactive elements — colors, typography, icons, buttons, spacing, and animations. A good UI follows established design principles like visual hierarchy, consistency, contrast, and alignment. It guides the user's eye to the most important information and actions.

The statistics speak for themselves: every dollar invested in UX returns between $2 and $100 in ROI. Users form an opinion about a website in just 50 milliseconds. 88% of online consumers are less likely to return to a site after a bad experience. And 94% of first impressions are design-related.

Mobile-first design has become essential. With over 60% of web traffic coming from mobile devices, designing for small screens first ensures your product works everywhere. Responsive design, touch-friendly interfaces, and fast load times are non-negotiable.

Accessibility (a11y) is both an ethical responsibility and a legal requirement. Designing for users with disabilities — visual impairments, motor limitations, cognitive differences — improves the experience for everyone. Proper color contrast, keyboard navigation, screen reader support, and clear language benefit all users.

Design systems and component libraries ensure consistency across large products. Tools like Figma, Sketch, and Adobe XD enable collaborative design workflows, while systems like Material Design and Apple's Human Interface Guidelines provide proven patterns to follow.`,
        author: "Diana Roberts",
        authorEmail: adminEmail,
        category: "Education",
      },
      {
        title: "Getting Started with TypeScript: Type-Safe JavaScript",
        summary: "Why TypeScript is revolutionizing JavaScript development with static typing.",
        content: `TypeScript is a superset of JavaScript that adds optional static typing. Developed by Microsoft, it has rapidly become the industry standard for large-scale JavaScript applications. Every valid JavaScript file is also valid TypeScript, making migration gradual and painless.

The core benefit of TypeScript is catching errors at compile time rather than runtime. When you define that a function expects a number, TypeScript will immediately flag an error if you accidentally pass a string. This eliminates an entire category of bugs — the kind that would otherwise only surface in production.

TypeScript's type system goes far beyond simple primitives. Interfaces define the shape of objects. Generics enable reusable, type-safe functions and classes. Union types allow a value to be one of several types. Utility types like Partial, Required, Pick, and Omit transform existing types without duplication.

IDE support is where TypeScript truly shines. Editors like VS Code provide intelligent autocompletion, inline documentation, refactoring tools, and real-time error checking — all powered by TypeScript's type information. This dramatically improves developer productivity and reduces the time spent debugging.

TypeScript integrates seamlessly with modern frameworks. React with TypeScript provides typed props and state. Node.js with TypeScript enables type-safe APIs. Angular was built with TypeScript from the ground up. Even Vue.js 3 was rewritten in TypeScript.

The adoption numbers are impressive: TypeScript is used by 78% of the top 10,000 npm packages. Companies like Google, Microsoft, Airbnb, Slack, and Stripe have adopted TypeScript for their production codebases. Stack Overflow surveys consistently rank it among the most loved programming languages.

Starting with TypeScript is straightforward. Install it with npm, create a tsconfig.json file, and start adding type annotations to your existing JavaScript. You can adopt it incrementally — no need to rewrite your entire codebase at once.`,
        author: "Edward Brown",
        authorEmail: adminEmail,
        category: "Technology",
      },
    ];

    const existingAdmin = await EmployeeModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      // Update existing admin's blogs with rich content
      existingAdmin.blogs = blogs;
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log("Admin blogs updated with rich content");
    } else {
      await EmployeeModel.create({
        username: "HARI", email: adminEmail, password: "717823p315",
        isAdmin: true, blogs,
      });
      console.log("Admin user created with rich blogs");
    }
  } catch (err) { console.error("Error setting up admin user:", err); }
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
const PORT = 3001;
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