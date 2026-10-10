import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSponsors } from '../hooks/useSponsors';
import ImageUpload from './ImageUpload';
import { SplitLayout, ListRow, EditorPanel, ConfirmDelete, Field, PageHead, EmptyState } from './ui';

const EMPTY_FORM = { logo: '', name: '', addr: '', tierLabel: '', tierAmount: '', tierOrder: 0, order: 0 };

export default function SponsorsPanel({ toast }) {
  const { tiers, sponsors } = useSponsors();
  // sel: { kind: 'sponsor', id } | { kind: 'new' } | { kind: 'tier', label } | null
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tierForm, setTierForm] = useState({ label: '', amount: '', tierOrder: 0 });
  const [useNewTier, setUseNewTier] = useState(false);
  const [saving, setSaving] = useState(false);

  function openAdd(tier) {
    const t = tier || tiers[0];
    const maxOrder = t ? sponsors.filter(s => s.tierLabel === t.tierLabel).reduce((m, s) => Math.max(m, s.order ?? 0), -1) : -1;
    setForm({ ...EMPTY_FORM, tierLabel: t?.tierLabel || '', tierAmount: t?.tierAmount || '', tierOrder: t?.tierOrder ?? 0, order: maxOrder + 1 });
    setUseNewTier(!t);
    setTierForm({ label: '', amount: '', tierOrder: tiers.length });
    setSel({ kind: 'new' });
  }

  function openEdit(s) {
     
    const { id, ...rest } = s;
    setForm({ ...EMPTY_FORM, ...rest });
    setUseNewTier(false);
    setSel({ kind: 'sponsor', id });
  }

  function openEditTier(tier) {
    setTierForm({ label: tier.tierLabel, amount: tier.tierAmount, tierOrder: tier.tierOrder });
    setSel({ kind: 'tier', label: tier.tierLabel });
  }

  async function saveSponsor() {
    const data = useNewTier
      ? { ...form, tierLabel: tierForm.label, tierAmount: tierForm.amount, tierOrder: tierForm.tierOrder }
      : form;
    if (!data.logo) { toast('Please upload a logo', 'error'); return; }
    if (!data.tierLabel) { toast('Please select or create a tier', 'error'); return; }
    setSaving(true);
    try {
      if (sel?.kind === 'sponsor') {
        await setDoc(doc(db, 'sponsors', sel.id), data);
      } else {
        const r = await addDoc(collection(db, 'sponsors'), data);
        setSel({ kind: 'sponsor', id: r.id });
      }
      setUseNewTier(false);
      toast('Saved ✓');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSponsor(id) {
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      setSel(null);
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function saveEditTier() {
    const affected = sponsors.filter(s => s.tierLabel === sel.label);
    setSaving(true);
    try {
      await Promise.all(affected.map(s => {
         
        const { id, ...rest } = s;
        return setDoc(doc(db, 'sponsors', id), {
          ...rest, tierLabel: tierForm.label, tierAmount: tierForm.amount, tierOrder: tierForm.tierOrder,
        });
      }));
      toast('Tier updated ✓');
      setSel({ kind: 'tier', label: tierForm.label });
    } catch {
      toast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function swap(sponsor, dir) {
    const sorted = sponsors.filter(s => s.tierLabel === sponsor.tierLabel).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(s => s.id === sponsor.id);
    const other = sorted[idx + dir];
    if (!other) return;
     
    const { id: id1, ...r1 } = sponsor;
     
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'sponsors', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'sponsors', id2), { ...r2, order: sponsor.order ?? 0 }),
    ]);
    toast('Order saved ✓');
  }

  const rows = tiers.length === 0
    ? <EmptyState title="No sponsors yet" sub="Add a sponsor to create the first tier." />
    : tiers.map(tier => (
      <div key={tier.tierLabel} className="ad-group">
        <div className="ad-group-head">
          <div><strong>{tier.tierLabel}</strong><span className="ad-mono">{tier.tierAmount}</span></div>
          <div className="ad-actions">
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => openEditTier(tier)}>Edit tier</button>
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => openAdd(tier)}>+ Add</button>
          </div>
        </div>
        {tier.sponsors.length === 0 && <div className="ad-hint ad-pad">No sponsors in this tier.</div>}
        {tier.sponsors.map((s, i) => (
          <ListRow key={s.id}
                   title={s.name || s.addr || '(no name)'}
                   sub={`${s.addr && s.name ? s.addr + ' · ' : ''}position ${i + 1}`}
                   thumb={{ kind: 'logo', src: s.logo }}
                   selected={sel?.kind === 'sponsor' && sel.id === s.id}
                   onSelect={() => openEdit(s)}
                   onUp={() => swap(s, -1)} onDown={() => swap(s, 1)}
                   upDisabled={i === 0} downDisabled={i === tier.sponsors.length - 1} />
        ))}
      </div>
    ));

  let editor;
  if (sel?.kind === 'tier') {
    editor = (
      <EditorPanel key={`tier-${sel.label}`} title="Edit tier" meta={sel.label} onSave={saveEditTier}
                   onCancel={() => setSel(null)} saveLabel="Save tier" saving={saving}>
        <Field label="Tier name" span={1} htmlFor="tf-l">
          <input id="tf-l" className="ad-input" value={tierForm.label} onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))} />
        </Field>
        <Field label="Amount label" span={1} htmlFor="tf-a">
          <input id="tf-a" className="ad-input" value={tierForm.amount} placeholder="$1,000+" onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))} />
        </Field>
        <Field label="Display order" hint="0 = first" htmlFor="tf-o">
          <input id="tf-o" className="ad-input" type="number" value={tierForm.tierOrder} onChange={e => setTierForm(f => ({ ...f, tierOrder: Number(e.target.value) }))} />
        </Field>
      </EditorPanel>
    );
  } else if (sel) {
    const isNew = sel.kind === 'new';
    editor = (
      <EditorPanel key={isNew ? 'new' : sel.id} title={isNew ? 'Add sponsor' : 'Edit sponsor'}
                   meta={isNew ? 'New' : form.name || form.addr} onSave={saveSponsor}
                   onCancel={() => setSel(null)} saveLabel={isNew ? 'Add sponsor' : 'Save changes'} saving={saving}
                   deleteSlot={!isNew && <ConfirmDelete noun="sponsor" onConfirm={() => deleteSponsor(sel.id)} />}>
        <Field label="Logo" tag="required">
          <ImageUpload value={form.logo} onChange={url => setForm(f => ({ ...f, logo: url }))} path="sponsors/logo" />
        </Field>
        <Field label="Name" tag="optional" htmlFor="sp-name">
          <input id="sp-name" className="ad-input" value={form.name} placeholder="Acme Corporation" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Address" htmlFor="sp-addr">
          <input id="sp-addr" className="ad-input" value={form.addr} placeholder="123 Main St, Fort Wayne, IN" onChange={e => setForm(f => ({ ...f, addr: e.target.value }))} />
        </Field>
        <Field label="Tier" htmlFor="sp-tier" hint="New tiers ask for a tier name and an amount label.">
          <select id="sp-tier" className="ad-input" value={useNewTier ? '__new__' : form.tierLabel}
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
        </Field>
        {useNewTier && (
          <>
            <Field label="Tier name" span={1} htmlFor="sp-nt">
              <input id="sp-nt" className="ad-input" value={tierForm.label} placeholder="Diamond Level" onChange={e => setTierForm(f => ({ ...f, label: e.target.value }))} />
            </Field>
            <Field label="Amount label" span={1} htmlFor="sp-na">
              <input id="sp-na" className="ad-input" value={tierForm.amount} placeholder="$2,000+" onChange={e => setTierForm(f => ({ ...f, amount: e.target.value }))} />
            </Field>
          </>
        )}
      </EditorPanel>
    );
  } else {
    editor = <EmptyState title="Select a sponsor" sub="Pick a sponsor or tier on the left to edit it." onAdd={() => openAdd()} addLabel="Add sponsor" />;
  }

  return (
    <div className="ad-screen">
      <PageHead title="Sponsors" sub="Grouped by tier. Arrows reorder a sponsor inside its tier and save right away." />
      <SplitLayout countLabel={`${sponsors.length} sponsor${sponsors.length === 1 ? '' : 's'}`}
                   addLabel="Add sponsor" onAdd={() => openAdd()} list={rows} editor={editor} />
    </div>
  );
}
