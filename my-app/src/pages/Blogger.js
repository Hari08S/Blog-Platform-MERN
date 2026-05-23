import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Favorite, Edit, Delete, Add, Save, Close, ChatBubbleOutline, Visibility, AccessTime, DeleteOutline } from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Blogger.css";

const CATEGORIES = ["Technology", "Lifestyle", "Travel", "Food & Cooking", "Health & Fitness", "Education", "Business", "Entertainment", "Science", "General"];

function getReadingTime(c) { return Math.max(1, Math.ceil((c?.split(/\s+/).length || 0) / 200)); }

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Blogger({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editedBlog, setEditedBlog] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", summary: "", content: "", author: "", category: "General", imageFile: null });
  const [commentsBlog, setCommentsBlog] = useState(null); // Blog whose comments are being viewed
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/user-blogs?email=${user.email}`);
      if (res.data.success) setBlogs(res.data.blogs || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("email", user.email); fd.append("id", editedBlog._id);
      fd.append("title", editedBlog.title); fd.append("summary", editedBlog.summary);
      fd.append("content", editedBlog.content); fd.append("author", editedBlog.author);
      fd.append("category", editedBlog.category || "General");
      if (editedBlog.imageFile) fd.append("image", editedBlog.imageFile);
      const res = await axios.put("http://localhost:3001/update-blog", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) { setBlogs(prev => prev.map(b => b._id === editedBlog._id ? res.data.blog : b)); setEditMode(null); alert("Blog updated!"); }
    } catch (err) { alert("Failed to update."); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      setLoading(true);
      await axios.delete("http://localhost:3001/delete-blog", { data: { email: user.email, id } });
      await fetchBlogs();
      alert("Blog deleted!");
    } catch (err) { alert("Failed to delete."); } finally { setLoading(false); }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.summary || !newBlog.content || !newBlog.author || !newBlog.imageFile) {
      alert("Please fill all fields including image."); return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("email", user.email); fd.append("title", newBlog.title);
      fd.append("summary", newBlog.summary); fd.append("content", newBlog.content);
      fd.append("author", newBlog.author); fd.append("category", newBlog.category);
      fd.append("image", newBlog.imageFile);
      const res = await axios.post("http://localhost:3001/add-blog", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) { await fetchBlogs(); setShowForm(false); setNewBlog({ title: "", summary: "", content: "", author: "", category: "General", imageFile: null }); alert("Blog published!"); }
    } catch (err) { alert("Failed to add blog."); } finally { setLoading(false); }
  };

  const handleDeleteComment = async (blog, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await axios.post("http://localhost:3001/delete-comment", {
        requesterEmail: user.email,
        authorEmail: user.email,
        blogId: blog._id,
        commentId,
      });
      if (res.data.success) {
        const updatedComments = (blog.comments || []).filter(c => c._id !== commentId);
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, comments: updatedComments } : b));
        setCommentsBlog(prev => prev ? { ...prev, comments: updatedComments } : null);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };
  const filtered = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="b-container">
      <Navbar user={user} showBack={true} backTo="/choose-role" onLogout={handleLogout} />

      <div className="b-toolbar">
        <h2 className="b-page-title">My Blogs <span className="b-count">{blogs.length}</span></h2>
        <div className="b-toolbar-right">
          <input className="b-search" placeholder="🔍  Search my blogs..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="b-add-btn" onClick={() => { setShowForm(true); setNewBlog({ title: "", summary: "", content: "", author: user?.username || "", category: "General", imageFile: null }); }}>
            <Add /> New Blog
          </button>
        </div>
      </div>

      {showForm && (
        <div className="b-form-overlay" onClick={() => setShowForm(false)}>
          <form className="b-form" onClick={e => e.stopPropagation()} onSubmit={handleAddBlog}>
            <div className="b-form-header">
              <h2>Create New Blog</h2>
              <button type="button" className="b-form-close" onClick={() => setShowForm(false)}><Close /></button>
            </div>
            <input className="b-input" placeholder="Blog Title" value={newBlog.title} onChange={e => setNewBlog(p => ({ ...p, title: e.target.value }))} />
            <input className="b-input" placeholder="Short Summary" value={newBlog.summary} onChange={e => setNewBlog(p => ({ ...p, summary: e.target.value }))} />
            <textarea className="b-input b-textarea" placeholder="Write your blog content..." value={newBlog.content} onChange={e => setNewBlog(p => ({ ...p, content: e.target.value }))} />
            <div className="b-form-row">
              <input className="b-input" placeholder="Author Name" value={newBlog.author} onChange={e => setNewBlog(p => ({ ...p, author: e.target.value }))} style={{flex:1}} />
              <select className="b-input b-select" value={newBlog.category} onChange={e => setNewBlog(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="b-file-wrap">
              <label className="b-file-label">
                📸 {newBlog.imageFile ? newBlog.imageFile.name : "Choose Cover Image"}
                <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && setNewBlog(p => ({ ...p, imageFile: e.target.files[0] }))} />
              </label>
            </div>
            <div className="b-form-actions">
              <button type="submit" className="b-publish-btn" disabled={loading}><Save /> {loading ? "Publishing..." : "Publish"}</button>
              <button type="button" className="b-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="b-grid">
        {loading && blogs.length === 0 ? (
          <div className="b-loading"><div className="b-spinner"></div><p>Loading...</p></div>
        ) : filtered.length > 0 ? (
          filtered.map(blog => (
            <div key={blog._id} className="b-card">
              {editMode === blog._id ? (
                <div className="b-edit-form">
                  <input className="b-input" placeholder="Title" value={editedBlog.title || ""} onChange={e => setEditedBlog(p => ({ ...p, title: e.target.value }))} />
                  <input className="b-input" placeholder="Summary" value={editedBlog.summary || ""} onChange={e => setEditedBlog(p => ({ ...p, summary: e.target.value }))} />
                  <textarea className="b-input b-textarea" placeholder="Content" value={editedBlog.content || ""} onChange={e => setEditedBlog(p => ({ ...p, content: e.target.value }))} />
                  <div className="b-form-row">
                    <input className="b-input" placeholder="Author" value={editedBlog.author || ""} onChange={e => setEditedBlog(p => ({ ...p, author: e.target.value }))} style={{flex:1}} />
                    <select className="b-input b-select" value={editedBlog.category || "General"} onChange={e => setEditedBlog(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <input type="file" accept="image/*" className="b-input" onChange={e => e.target.files[0] && setEditedBlog(p => ({ ...p, imageFile: e.target.files[0] }))} />
                  <div className="b-form-actions">
                    <button className="b-publish-btn" onClick={handleSave} disabled={loading}><Save /> Save</button>
                    <button className="b-cancel-btn" onClick={() => setEditMode(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`b-card-img ${!blog.image?.data ? 'no-image' : ''}`} style={blog.image?.data ? { backgroundImage: `url(data:${blog.image.contentType};base64,${blog.image.data})` } : {}}>
                    <span className="b-cat-badge" data-cat={blog.category}>{blog.category || "General"}</span>
                    {!blog.image?.data && <span className="b-img-placeholder">📝 Blog Post</span>}
                  </div>
                  <div className="b-card-body">
                    <h3 className="b-card-title">{blog.title}</h3>
                    <p className="b-card-summary">{blog.summary}</p>
                    <div className="b-card-meta">
                      <span>By {blog.author}</span>
                      <span><AccessTime style={{fontSize:14}}/> {getReadingTime(blog.content)} min read</span>
                    </div>
                    <div className="b-card-stats">
                      <span className="b-stat"><Favorite style={{fontSize:16, color:"#f5576c"}}/> {blog.likes?.length || 0} likes</span>
                      <span className="b-stat b-stat-clickable" onClick={() => setCommentsBlog(blog)}>
                        <ChatBubbleOutline style={{fontSize:16}}/> {blog.comments?.length || 0} comments
                      </span>
                      <span className="b-stat"><Visibility style={{fontSize:16}}/> {blog.views || 0} views</span>
                    </div>
                    <div className="b-card-actions">
                      <button className="b-edit-btn" onClick={() => { setEditMode(blog._id); setEditedBlog({ ...blog, imageFile: null }); }}><Edit /> Edit</button>
                      <button className="b-delete-btn" onClick={() => handleDelete(blog._id)}><Delete /> Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="b-empty">
            <h2>No blogs yet</h2>
            <p>Click "New Blog" to write your first post!</p>
          </div>
        )}
      </div>

      {/* Comments Modal for Blogger */}
      {commentsBlog && (
        <div className="b-comments-overlay" onClick={() => setCommentsBlog(null)}>
          <div className="b-comments-modal" onClick={e => e.stopPropagation()}>
            <div className="b-comments-modal-header">
              <div>
                <h2>Comments</h2>
                <p className="b-comments-blog-title">on "{commentsBlog.title}"</p>
              </div>
              <button className="b-comments-close" onClick={() => setCommentsBlog(null)}><Close /></button>
            </div>
            <div className="b-comments-list">
              {(commentsBlog.comments || []).length > 0 ? (
                (commentsBlog.comments || []).slice().reverse().map(c => (
                  <div key={c._id} className="b-comment-item">
                    <div className="b-comment-avatar">{c.user?.[0]?.toUpperCase() || "?"}</div>
                    <div className="b-comment-content">
                      <div className="b-comment-meta">
                        <strong>{c.user}</strong>
                        <span className="b-comment-email">{c.userEmail}</span>
                        <span className="b-comment-time">{timeAgo(c.createdAt)}</span>
                        <button
                          className="b-comment-delete"
                          title="Delete this comment"
                          onClick={() => handleDeleteComment(commentsBlog, c._id)}
                        >
                          <DeleteOutline style={{ fontSize: 16 }} />
                        </button>
                      </div>
                      <p className="b-comment-text">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="b-comments-empty">
                  <ChatBubbleOutline style={{ fontSize: 40, color: "rgba(255,255,255,0.15)" }} />
                  <p>No comments on this blog yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}