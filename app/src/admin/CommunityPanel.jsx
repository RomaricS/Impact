import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCommunity } from '../hooks/useCommunity';
import ImageUpload from './ImageUpload';

const EMPTY_FORM = {
  headline: '', description: '', steps: [''],
  imageUrl: '', imageBg: '#1e3a2f',
  linkUrl: '', linkLabel: '', order: 0,
};

export default function CommunityPanel({ toast }) {
  const { campaigns } = useCommunity();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: campaigns.length });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(c) {
    const { id, ...rest } = c;
    setForm({ ...EMPTY_FORM, ...rest, steps: rest.steps?.length ? rest.steps : [''] });
    setEditingId(id);
    setMode('edit');
  }

  function updateStep(i, value) {
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? value : s) }));
  }

  function addStep() {
    setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  }

  function removeStep(i) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  }

  async function save() {
    if (!form.headline.trim()) { toast('Headline is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, steps: form.steps.filter(s => s.trim()) };
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'community', editingId), payload);
      } else {
        await addDoc(collection(db, 'community'), payload);
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
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteDoc(doc(db, 'community', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function moveUp(campaign) {
    const sorted = [...campaigns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === campaign.id);
    if (idx <= 0) return;
    const other = sorted[idx - 1];
    const { id: id1, ...r1 } = campaign;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'community', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'community', id2), { ...r2, order: campaign.order ?? 0 }),
    ]);
  }

  async function moveDown(campaign) {
    const sorted = [...campaigns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === campaign.id);
    if (idx >= sorted.length - 1) return;
    const other = sorted[idx + 1];
    const { id: id1, ...r1 } = campaign;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'community', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'community', id2), { ...r2, order: campaign.order ?? 0 }),
    ]);
  }

  /* ── Add / Edit form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Community</button>
        <div className="admin-page-title">{mode === 'add' ? 'New Campaign' : 'Edit Campaign'}</div>
        <div className="admin-card">
          <div className="admin-form">

            <div className="form-group">
              <label className="form-label">Headline</label>
              <input className="form-input" value={form.headline}
                     onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                     placeholder="Support the Next Generation." />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Every purchase you make can fund scholarships for our athletes — at zero extra cost to you." />
            </div>

            <div className="form-group">
              <label className="form-label">Steps</label>
              {form.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pink)', fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                  <input className="form-input" style={{ flex: 1, marginBottom: 0 }} value={step}
                         onChange={e => updateStep(i, e.target.value)}
                         placeholder={`Step ${i + 1}`} />
                  {form.steps.length > 1 && (
                    <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeStep(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm"
                      style={{ marginTop: '0.25rem' }} onClick={addStep}>+ Add Step</button>
            </div>

            <div className="form-group">
              <label className="form-label">Campaign Image / Logo</label>
              <ImageUpload value={form.imageUrl}
                           onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                           path="community/image" />
            </div>

            <div className="form-group">
              <label className="form-label">Image Card Background Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={form.imageBg}
                       onChange={e => setForm(f => ({ ...f, imageBg: e.target.value }))}
                       style={{ width: 44, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                <input className="form-input" value={form.imageBg}
                       onChange={e => setForm(f => ({ ...f, imageBg: e.target.value }))}
                       placeholder="#1e3a2f" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input className="form-input" value={form.linkUrl}
                       onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                       placeholder="https://kroger.com/…" />
              </div>
              <div className="form-group">
                <label className="form-label">Link Label</label>
                <input className="form-input" value={form.linkLabel}
                       onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))}
                       placeholder="Learn More" />
              </div>
            </div>

            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Campaign'}
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
          <div className="admin-page-title">Community</div>
          <div className="admin-page-sub">Manage community campaigns shown on the public site. Two or more campaigns appear as a slider.</div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ New Campaign</button>
      </div>

      {campaigns.length === 0 && (
        <div className="admin-empty">No campaigns yet. Click "New Campaign" to create one.</div>
      )}

      <div className="admin-list">
        {campaigns.map(c => (
          <div key={c.id} className="admin-list-item">
            {c.imageUrl && (
              <div style={{ width: 48, height: 30, background: c.imageBg || '#333', borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
              </div>
            )}
            <div className="admin-list-item-info">
              <strong>{c.headline}</strong>
              <span>{c.steps?.length || 0} steps</span>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveUp(c)}>↑</button>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveDown(c)}>↓</button>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(c.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
