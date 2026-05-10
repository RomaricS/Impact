import { useState, useEffect, useRef } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAnnouncements } from '../hooks/useAnnouncements';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';

const TAGS = ['Announcement', 'Signing', 'Tournament', 'Award'];
const EMPTY_FORM = { title: '', body: '', tag: 'Announcement', photoUrl: '', linkUrl: '', linkLabel: '', date: '', fileUrl: '', fileLabel: '' };

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsPanel({ toast }) {
  const { announcements } = useAnnouncements(100);
  const [mode, setMode] = useState('list');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [localList, setLocalList] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!isDirtyRef.current) setLocalList(announcements);
  }, [announcements]);

  function moveUp(i) {
    if (i === 0) return;
    const next = [...localList];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setLocalList(next);
    isDirtyRef.current = true;
    setIsDirty(true);
  }

  function moveDown(i) {
    if (i === localList.length - 1) return;
    const next = [...localList];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setLocalList(next);
    isDirtyRef.current = true;
    setIsDirty(true);
  }

  function resetOrder() {
    isDirtyRef.current = false;
    setIsDirty(false);
    setLocalList(announcements);
  }

  async function saveOrder() {
    setSavingOrder(true);
    try {
      await Promise.all(
        localList.map((post, i) =>
          setDoc(doc(db, 'announcements', post.id), { sort: i + 1 }, { merge: true })
        )
      );
      toast('Order saved ✓');
      isDirtyRef.current = false;
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSavingOrder(false);
    }
  }

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
        await addDoc(collection(db, 'announcements'), { ...payload, sort: 0 });
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
            <div className="form-group">
              <label className="form-label">Downloadable File (optional)</label>
              <FileUpload value={form.fileUrl}
                          onChange={url => setForm(f => ({ ...f, fileUrl: url }))}
                          path="announcements/file" />
            </div>
            {form.fileUrl && (
              <div className="form-group">
                <label className="form-label">File Button Label</label>
                <input className="form-input" value={form.fileLabel}
                       onChange={e => setForm(f => ({ ...f, fileLabel: e.target.value }))}
                       placeholder="Download Flyer" />
              </div>
            )}
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
          <div className="admin-page-sub">Use ↑ ↓ to reorder, then Save Order. New posts appear first until ordered.</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ New Post</button>
      </div>

      {isDirty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,31,109,0.08)', border: '1px solid rgba(255,31,109,0.25)', borderRadius: '8px', fontSize: '0.83rem' }}>
          <span style={{ flex: 1, color: 'var(--fg)' }}>Unsaved order changes</span>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={resetOrder}>Reset</button>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={saveOrder} disabled={savingOrder}>
            {savingOrder ? 'Saving…' : 'Save Order'}
          </button>
        </div>
      )}

      {localList.length === 0 && (
        <div className="admin-empty">No posts yet. Click "New Post" to create one.</div>
      )}

      <div className="admin-list">
        {localList.map((post, i) => (
          <div key={post.id} className="admin-list-item">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '0.5rem' }}>
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                style={{ padding: '0 0.4rem', lineHeight: 1.2, minWidth: 0 }}
                onClick={() => moveUp(i)}
                disabled={i === 0}
                aria-label="Move up"
              >↑</button>
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                style={{ padding: '0 0.4rem', lineHeight: 1.2, minWidth: 0 }}
                onClick={() => moveDown(i)}
                disabled={i === localList.length - 1}
                aria-label="Move down"
              >↓</button>
            </div>
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
