import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAnnouncements } from '../hooks/useAnnouncements';
import ImageUpload from './ImageUpload';

const TAGS = ['Announcement', 'Signing', 'Tournament', 'Award'];
const EMPTY_FORM = { title: '', body: '', tag: 'Announcement', photoUrl: '', linkUrl: '', linkLabel: '', date: '' };

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsPanel({ toast }) {
  const { announcements } = useAnnouncements(50);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: todayLabel() });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(post) {
    const { id, createdAt, ...rest } = post;
    setForm({ ...EMPTY_FORM, ...rest });
    setEditingId(id);
    setMode('edit');
  }

  async function save() {
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    if (!form.body.trim())  { toast('Body is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, createdAt: Timestamp.now() };
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'announcements', editingId), payload);
      } else {
        await addDoc(collection(db, 'announcements'), payload);
      }
      toast('Saved ✓');
      setMode('list');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  /* ── Add / Edit form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Announcements</button>
        <div className="admin-page-title">{mode === 'add' ? 'New Post' : 'Edit Post'}</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title}
                     onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                     placeholder="Emma Johnson Signs with Purdue University" />
            </div>
            <div className="form-group">
              <label className="form-label">Body</label>
              <textarea className="form-textarea" rows={4} value={form.body}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="We are incredibly proud of Emma and her commitment…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tag</label>
                <select className="form-select" value={form.tag}
                        onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Display Date</label>
                <input className="form-input" value={form.date}
                       onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                       placeholder="Apr 18, 2026" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <ImageUpload value={form.photoUrl}
                           onChange={url => setForm(f => ({ ...f, photoUrl: url }))}
                           path="announcements/photo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input className="form-input" value={form.linkUrl}
                       onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                       placeholder="https://example.com/article" />
              </div>
              <div className="form-group">
                <label className="form-label">Link Label</label>
                <input className="form-input" value={form.linkLabel}
                       onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))}
                       placeholder="Read more" />
              </div>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Post'}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setMode('list')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div className="admin-page-title">Announcements</div>
          <div className="admin-page-sub">Create news posts visible on the public site. Newest posts appear first.</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ New Post</button>
      </div>

      {announcements.length === 0 && (
        <div className="admin-empty">No posts yet. Click "New Post" to create one.</div>
      )}

      <div className="admin-list">
        {announcements.map(post => (
          <div key={post.id} className="admin-list-item">
            <div className="admin-list-item-info">
              <strong>{post.title}</strong>
              <span>{post.date} · {post.tag}</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(post)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(post.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
