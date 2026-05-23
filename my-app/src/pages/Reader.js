import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Favorite, FavoriteBorder, BookmarkBorder, Bookmark, AccessTime, ChatBubbleOutline, Visibility, Close, Send, TrendingUp, NewReleases, Forum, DeleteOutline, EditOutlined, Check } from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Reader.css";

const CATEGORIES = ["All", "Technology", "Lifestyle", "Travel", "Food & Cooking", "Health & Fitness", "Education", "Business", "Entertainment", "Science", "General"];

function getReadingTime(content) {
  return Math.max(1, Math.ceil((content?.split(/\s+/).length || 0) / 200));
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}



function BlogDetailModal({ blog, user, onClose, onLike, onComment, onDeleteComment, onEditComment, onBookmark, bookmarks }) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const isLiked = blog.likes?.includes(user.email);
  const isBookmarked = bookmarks.includes(blog._id);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(blog, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  const handleEditSave = async (commentId) => {
    if (!editingText.trim()) return;
    setSubmitting(true);
    await onEditComment(blog, commentId, editingText.trim());
    setEditingCommentId(null);
    setEditingText("");
    setSubmitting(false);
  };

  return (
    <div className="r-modal-overlay" onClick={onClose}>
      <div className="r-modal" onClick={(e) => e.stopPropagation()}>
        <button className="r-modal-close" onClick={onClose}><Close /></button>
        {blog.image?.data && (
          <div className="r-modal-img-wrap">
            <img src={`data:${blog.image.contentType};base64,${blog.image.data}`} alt={blog.title} className="r-modal-img" />
          </div>
        )}
        <div className="r-modal-body">
          <span className="r-cat-badge" data-cat={blog.category}>{blog.category || "General"}</span>
          <h1 className="r-modal-title">{blog.title}</h1>
          <div className="r-modal-meta">
            <span>By <strong>{blog.author}</strong></span>
            <span>·</span>
            <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span>·</span>
            <span><AccessTime style={{ fontSize: 16, verticalAlign: "middle" }} /> {getReadingTime(blog.content)} min read</span>
          </div>
          <div className="r-modal-actions">
            <button className={`r-action-btn ${isLiked ? "liked" : ""}`} onClick={() => onLike(blog)}>
              {isLiked ? <Favorite /> : <FavoriteBorder />} {blog.likes?.length || 0}
            </button>
            <button className={`r-action-btn ${isBookmarked ? "bookmarked" : ""}`} onClick={() => onBookmark(blog._id)}>
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />} {isBookmarked ? "Saved" : "Save"}
            </button>
            <span className="r-views"><Visibility style={{ fontSize: 16 }} /> {blog.views || 0} views</span>
          </div>
          <hr className="r-divider" />
          <div className="r-modal-content">{blog.content}</div>
          <hr className="r-divider" />
          <div className="r-comments-section">
            <h3><ChatBubbleOutline /> Comments ({blog.comments?.length || 0})</h3>
            <div className="r-comment-input-wrap">
              <input className="r-comment-input" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} />
              <button className="r-comment-send" onClick={handleComment} disabled={submitting || !commentText.trim()}>
                <Send />
              </button>
            </div>
            <div className="r-comment-list">
              {(blog.comments || []).slice().reverse().map((c) => {
                const isOwner = c.userEmail === user.email;
                const canDelete = isOwner || blog.authorEmail === user.email;
                const isEditing = editingCommentId === c._id;
                return (
                  <div key={c._id} className="r-comment">
                    <div className="r-comment-avatar">{c.user?.[0]?.toUpperCase() || "?"}</div>
                    <div className="r-comment-body">
                      <div className="r-comment-header">
                        <strong>{c.user}</strong> <span className="r-comment-time">{timeAgo(c.createdAt)}</span>
                        <div className="r-comment-actions">
                          {isOwner && !isEditing && (
                            <button
                              className="r-comment-edit-btn"
                              title="Edit your comment"
                              onClick={(e) => { e.stopPropagation(); setEditingCommentId(c._id); setEditingText(c.text); }}
                            >
                              <EditOutlined style={{ fontSize: 15 }} />
                            </button>
                          )}
                          {canDelete && !isEditing && (
                            <button
                              className="r-comment-delete-btn"
                              title={isOwner ? "Delete your comment" : "Delete comment from your blog"}
                              onClick={(e) => { e.stopPropagation(); onDeleteComment(blog, c._id); }}
                            >
                              <DeleteOutline style={{ fontSize: 16 }} />
                            </button>
                          )}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="r-comment-edit-wrap">
                          <input
                            className="r-comment-edit-input"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEditSave(c._id)}
                            autoFocus
                          />
                          <button className="r-comment-edit-save" onClick={() => handleEditSave(c._id)} disabled={submitting || !editingText.trim()}>
                            <Check style={{ fontSize: 16 }} />
                          </button>
                          <button className="r-comment-edit-cancel" onClick={() => { setEditingCommentId(null); setEditingText(""); }}>
                            <Close style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      ) : (
                        <p>{c.text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!blog.comments || blog.comments.length === 0) && <p className="r-no-comments">No comments yet. Be the first!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reader({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/all-blogs");
      if (res.data.success) setBlogs(res.data.blogs || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/user-bookmarks?email=${user.email}`);
      if (res.data.success) setBookmarks(res.data.bookmarks || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) { fetchBlogs(); fetchBookmarks(); } }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = async (blog) => {
    try {
      const res = await axios.post("http://localhost:3001/like-blog", { likerEmail: user.email, authorEmail: blog.authorEmail, blogId: blog._id });
      if (res.data.success) {
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, likes: res.data.likes } : b));
        if (selectedBlog?._id === blog._id) setSelectedBlog(prev => ({ ...prev, likes: res.data.likes }));
      }
    } catch (err) { console.error(err); }
  };

  const handleComment = async (blog, text) => {
    try {
      const res = await axios.post("http://localhost:3001/add-comment", { commenterName: user.username, commenterEmail: user.email, authorEmail: blog.authorEmail, blogId: blog._id, text });
      if (res.data.success) {
        const updatedComments = [...(blog.comments || []), res.data.comment];
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, comments: updatedComments } : b));
        if (selectedBlog?._id === blog._id) setSelectedBlog(prev => ({ ...prev, comments: updatedComments }));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (blog, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await axios.post("http://localhost:3001/delete-comment", {
        requesterEmail: user.email,
        authorEmail: blog.authorEmail,
        blogId: blog._id,
        commentId,
      });
      if (res.data.success) {
        const updatedComments = (blog.comments || []).filter(c => c._id !== commentId);
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, comments: updatedComments } : b));
        if (selectedBlog?._id === blog._id) setSelectedBlog(prev => ({ ...prev, comments: updatedComments }));
      }
    } catch (err) { console.error(err); }
  };

  const handleEditComment = async (blog, commentId, newText) => {
    try {
      const res = await axios.post("http://localhost:3001/edit-comment", {
        requesterEmail: user.email,
        authorEmail: blog.authorEmail,
        blogId: blog._id,
        commentId,
        newText,
      });
      if (res.data.success) {
        const updatedComments = (blog.comments || []).map(c =>
          c._id === commentId ? { ...c, text: res.data.comment.text } : c
        );
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, comments: updatedComments } : b));
        if (selectedBlog?._id === blog._id) setSelectedBlog(prev => ({ ...prev, comments: updatedComments }));
      }
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async (blogId) => {
    try {
      const res = await axios.post("http://localhost:3001/toggle-bookmark", { email: user.email, blogId });
      if (res.data.success) setBookmarks(res.data.bookmarks);
    } catch (err) { console.error(err); }
  };

  const openBlog = async (blog) => {
    setSelectedBlog(blog);
    try { await axios.post("http://localhost:3001/view-blog", { authorEmail: blog.authorEmail, blogId: blog._id }); } catch (e) {}
  };

  let filtered = blogs;
  if (showBookmarked) filtered = filtered.filter(b => bookmarks.includes(b._id));
  if (selectedCat !== "All") filtered = filtered.filter(b => (b.category || "General") === selectedCat);
  if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  if (sortBy === "trending") filtered = [...filtered].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  else if (sortBy === "discussed") filtered = [...filtered].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
  else filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  return (
    <div className="r-container">
      <Navbar user={user} showBack={true} backTo="/choose-role" onLogout={handleLogout} />

      <div className="r-categories">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`r-cat-chip ${selectedCat === cat ? "active" : ""}`} onClick={() => setSelectedCat(cat)}>{cat}</button>
        ))}
      </div>

      <div className="r-toolbar">
        <input className="r-search" placeholder="🔍  Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="r-toolbar-btns">
          <button className={`r-sort-btn ${sortBy === "latest" ? "active" : ""}`} onClick={() => setSortBy("latest")}><NewReleases style={{fontSize:16}}/> Latest</button>
          <button className={`r-sort-btn ${sortBy === "trending" ? "active" : ""}`} onClick={() => setSortBy("trending")}><TrendingUp style={{fontSize:16}}/> Trending</button>
          <button className={`r-sort-btn ${sortBy === "discussed" ? "active" : ""}`} onClick={() => setSortBy("discussed")}><Forum style={{fontSize:16}}/> Discussed</button>
          <button className={`r-bookmark-toggle ${showBookmarked ? "active" : ""}`} onClick={() => setShowBookmarked(!showBookmarked)}>
            {showBookmarked ? <Bookmark /> : <BookmarkBorder />} Saved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="r-loading"><div className="r-spinner"></div><p>Loading blogs...</p></div>
      ) : filtered.length > 0 ? (
        <div className="r-grid">
          {filtered.map(blog => (
            <div key={blog._id} className="r-card" onClick={() => openBlog(blog)}>
              <div className={`r-card-img ${!blog.image?.data ? 'no-image' : ''}`} style={blog.image?.data ? { backgroundImage: `url(data:${blog.image.contentType};base64,${blog.image.data})` } : {}}>
                <span className="r-cat-badge" data-cat={blog.category}>{blog.category || "General"}</span>
                {!blog.image?.data && <span className="r-img-placeholder">📝 Blog Post</span>}
              </div>
              <div className="r-card-body">
                <h2 className="r-card-title">{blog.title}</h2>
                <p className="r-card-summary">{blog.summary}</p>
                <div className="r-card-footer">
                  <div className="r-card-author">
                    <div className="r-author-avatar">{blog.author?.[0]?.toUpperCase()}</div>
                    <span>{blog.author}</span>
                    <span className="r-card-time"><AccessTime style={{fontSize:14}}/> {getReadingTime(blog.content)} min</span>
                  </div>
                  <div className="r-card-stats">
                    <span className={blog.likes?.includes(user.email) ? "r-stat liked" : "r-stat"}><Favorite style={{fontSize:16}}/> {blog.likes?.length || 0}</span>
                    <span className="r-stat"><ChatBubbleOutline style={{fontSize:16}}/> {blog.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="r-empty">
          <h2>No blogs found</h2>
          <p>{showBookmarked ? "You haven't saved any blogs yet." : search ? "Try a different search term." : "No blogs available in this category."}</p>
        </div>
      )}

      {selectedBlog && (
        <BlogDetailModal blog={selectedBlog} user={user} onClose={() => setSelectedBlog(null)} onLike={handleLike} onComment={handleComment} onDeleteComment={handleDeleteComment} onEditComment={handleEditComment} onBookmark={handleBookmark} bookmarks={bookmarks} />
      )}

      <Footer />
    </div>
  );
}