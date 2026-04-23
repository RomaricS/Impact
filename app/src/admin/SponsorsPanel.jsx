import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSponsors } from '../hooks/useSponsors';
import ImageUpload from './ImageUpload';

const TIER_CLASSES = ['t-kill', 't-ace', 't-block'];
const EMPTY_FORM = { logo: '', name: '', addr: '', tierLabel: '', tierAmount: '', tierOrder: 0, order: 0 };

export default function SponsorsPanel({ toast }) {
  const { tiers, sponsors } = useSponsors();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit' | 'editTier'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingTierLabel, setEditingTierLabel] = useState(null);
  const [tierForm, setTierForm] = useState({ label: '', amount: '', tierOrder: 0 });
  const [useNewTier, setUseNewTier] = useState(false);

  function openAdd(tier) {
    const maxOrder = sponsors
      .filter(s => s.tierLabel === tier.tierLabel)
      .reduce((m, s) => Math.max(m, s.order ?? 0), -1);
    setForm({ logo: '', name: '', addr: '', tierLabel: tier.tierLabel, tierAmount: tier.tierAmount, tierOrder: tier.tierOrder, order: maxOrder + 1 });
    setUseNewTier(false);
    setTierForm({ label: '', amount: '', tierOrder: tiers.length });
    setEditingId(null);
    setMode('add');
  }

  function openEdit(s) {
    const { id, ...rest } = s;
    setForm(rest);
    setEditingId(id);
    setUseNewTier(false);
    setMode('edit');
  }

  function openEditTier(tier) {
    setTierForm({ label: tier.tierLabel, amount: tier.tierAmount, tierOrder: tier.tierOrder });
    setEditingTierLabel(tier.tierLabel);
    setMode('editTier');
  }

  async function saveSponsor() {
    const data = useNewTier
      ? { ...form, tierLabel: tierForm.label, tierAmount: tierForm.amount, tierOrder: tierForm.tierOrder }
      : form;
    if (!data.logo) { toast('Please upload a logo', 'error'); return; }
    if (!data.tierLabel) { toast('Please select or create a tier', 'error'); return; }
    try {
      if (mode === 'edit' && editingId) {
        await setDoc(doc(db, 'sponsors', editingId), data);
      } else {
        await addDoc(collection(db, 'sponsors'), data);
      }
      toast('Saved ✓');
      setMode('list');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    }
  }

  async function deleteSponsor(id) {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function saveEditTier() {
    const affected = sponsors.filter(s => s.tierLabel === editingTierLabel);
    try {
      await Promise.all(affected.map(s => {
        const { id, ...rest } = s;
        return setDoc(doc(db, 'sponsors', id), {
          ...rest,
          tierLabel: tierForm.label,
          tierAmount: tierForm.amount,
          tierOrder: tierForm.tierOrder,
        });
      }));
      toast('Tier updated ✓');
      setMode('list');
    } catch {
      toast('Update failed', 'error');
    }
  }

  async function moveUp(sponsor) {
    const sorted = sponsors
      .filter(s => s.tierLabel === sponsor.tierLabel)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(s => s.id === sponsor.id);
    if (idx <= 0) return;
    const other = sorted[idx - 1];
    const { id: id1, ...r1 } = sponsor;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'sponsors', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'sponsors', id2), { ...r2, order: sponsor.order ?? 0 }),
    ]);
  }

  async function moveDown(sponsor) {
    const sorted = sponsors
      .filter(s => s.tierLabel === sponsor.tierLabel)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(s => s.id === sponsor.id);
    if (idx >= sorted.length - 1) return;
    const other = sorted[idx + 1];
    const { id: id1, ...r1 } = sponsor;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'sponsors', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'sponsors', id2), { ...r2, order: sponsor.order ?? 0 }),
    ]);
  }

  /* ── Add / Edit sponsor form ── */
  if (mode === 'add' || mode === 'edit') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Sponsors</button>
        <div className="admin-page-title">{mode === 'add' ? 'Add Sponsor' : 'Edit Sponsor'}</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Logo</label>
              <ImageUpload value={form.logo} onChange={url => setForm(f => ({ ...f, logo: url }))} path="sponsors/logo" />
            </div>
            <div className="form-group">
              <label className="form-label">Name (optional)</label>
              <input className="form-input" value={form.name}
                     onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                     placeholder="Acme Corporation" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.addr}
                     onChange={e => setForm(f => ({ ...f, addr: e.target.value }))}
                     placeholder="123 Main St, Fort Wayne, IN" />
            </div>
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select className="form-select"
                      value={useNewTier ? '__new__' : form.tierLabel}
                      onChange={e => {
                        if (e.target.value === '__new__') {
                          setUseNewTier(true);
                          setTierForm({ label: '', amount: '', tierOrder: tiers.length });
                        } else {
                          const t = tiers.find(t => t.tierLabel === e.target.value);
                          setUseNewTier(false);
                          setForm(f => ({ ...f, tierLabel: e.target.value, tierAmount: t?.tierAmount || '', tierOrder: t?.tierOrder ?? 0 }));
                        }
                      }}>
                <option value="">Select tier…</option>
                {tiers.map(t => <option key={t.tierLabel} value={t.tierLabel}>{t.tierLabel} ({t.tierAmount})</option>)}
                <option value="__new__">+ New tier…</option>
              </select>
            </div>
            {useNewTier && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tier Name</label>
                  <input className="form-input" value={tierForm.label}
                         onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))}
                         placeholder="Diamond Level" />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Label</label>
                  <input className="form-input" value={tierForm.amount}
                         onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))}
                         placeholder="$2,000+" />
                </div>
              </div>
            )}
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveSponsor}>Save Sponsor</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setMode('list')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Edit tier form ── */
  if (mode === 'editTier') {
    return (
      <div>
        <button className="admin-back" onClick={() => setMode('list')}>← Sponsors</button>
        <div className="admin-page-title">Edit Tier</div>
        <div className="admin-card">
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tier Name</label>
                <input className="form-input" value={tierForm.label}
                       onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount Label</label>
                <input className="form-input" value={tierForm.amount}
                       onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))}
                       placeholder="$1,000+" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Display Order (0 = first)</label>
              <input className="form-input" type="number" value={tierForm.tierOrder}
                     onChange={e => setTierForm(f => ({ ...f, tierOrder: Number(e.target.value) }))} />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-primary" onClick={saveEditTier}>Save Tier</button>
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
      <div className="admin-page-title">Sponsors</div>
      <div className="admin-page-sub">Manage sponsor tiers and logos. Changes appear immediately on the public site.</div>

      {tiers.length === 0 && (
        <div className="admin-empty">No sponsors yet. Add a sponsor to create the first tier.</div>
      )}

      {tiers.map((tier, ti) => (
        <div key={tier.tierLabel} className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className={`tier-pill ${TIER_CLASSES[ti] || 't-block'}`}>{tier.tierLabel}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{tier.tierAmount}</span>
            <div style={{ flex: 1 }} />
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditTier(tier)}>Edit Tier</button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => openAdd(tier)}>+ Add Sponsor</button>
          </div>
          <div className="admin-list">
            {tier.sponsors.map(s => (
              <div key={s.id} className="admin-list-item">
                {s.logo && (
                  <img src={s.logo} alt="logo"
                       style={{ width: 60, height: 32, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 2, flexShrink: 0 }} />
                )}
                <div className="admin-list-item-info">
                  <strong>{s.addr || '(no address)'}</strong>
                </div>
                <div className="admin-actions">
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveUp(s)}>↑</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => moveDown(s)}>↓</button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteSponsor(s.id)}>✕</button>
                </div>
              </div>
            ))}
            {tier.sponsors.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '0.5rem 0' }}>No sponsors in this tier.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
