import { useState } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCommunity } from '../hooks/useCommunity';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import { SplitLayout, ListRow, EditorPanel, ConfirmDelete, Field, PageHead, EmptyState } from './ui';

const EMPTY_FORM = {
  headline: '', description: '', steps: [''],
  imageUrl: '', imageBg: '#1e3a2f',
  linkUrl: '', linkLabel: '',
  fileUrl: '', fileLabel: '',
  order: 0,
};

export default function CommunityPanel({ toast }) {
  const { campaigns } = useCommunity();
  const [sel, setSel] = useState(null); // id | 'new' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm({ ...EMPTY_FORM, order: campaigns.length });
    setSel('new');
  }

  function openEdit(c) {
    const { id, ...rest } = c;
    setForm({ ...EMPTY_FORM, ...rest, steps: rest.steps?.length ? rest.steps : [''] });
    setSel(id);
  }

  const updateStep = (i, value) => setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? value : s) }));
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const removeStep = i => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  async function save() {
    if (!form.headline.trim()) { toast('Headline is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, steps: form.steps.filter(s => s.trim()) };
      if (sel !== 'new') {
        await setDoc(doc(db, 'community', sel), payload);
      } else {
        const r = await addDoc(collection(db, 'community'), payload);
        setSel(r.id);
      }
      toast('Saved ✓');
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await deleteDoc(doc(db, 'community', id));
      setSel(null);
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  async function swap(campaign, dir) {
    const sorted = [...campaigns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === campaign.id);
    const other = sorted[idx + dir];
    if (!other) return;
    const { id: id1, ...r1 } = campaign;
    const { id: id2, ...r2 } = other;
    await Promise.all([
      setDoc(doc(db, 'community', id1), { ...r1, order: other.order ?? 0 }),
      setDoc(doc(db, 'community', id2), { ...r2, order: campaign.order ?? 0 }),
    ]);
    toast('Order saved ✓');
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isNew = sel === 'new';

  const editor = sel === null
    ? <EmptyState title="Select a campaign" sub="Pick a campaign on the left to edit it." onAdd={openAdd} addLabel="Add campaign" />
    : (
      <EditorPanel key={sel} title={isNew ? 'Add campaign' : 'Edit campaign'} meta={isNew ? 'New' : form.headline}
                   onSave={save} onCancel={() => setSel(null)} saveLabel={isNew ? 'Add campaign' : 'Save changes'} saving={saving}
                   deleteSlot={!isNew && <ConfirmDelete noun="campaign" onConfirm={() => remove(sel)} />}>
        <Field label="Headline" tag="required" htmlFor="cm-h">
          <input id="cm-h" className="ad-input" value={form.headline} placeholder="Support the Next Generation." onChange={e => set('headline', e.target.value)} />
        </Field>
        <Field label="Description" htmlFor="cm-d">
          <textarea id="cm-d" className="ad-input ad-textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
        </Field>
        <Field label="Steps">
          <div className="ad-steps">
            {form.steps.map((step, i) => (
              <div key={i} className="ad-step">
                <span className="ad-step-n">{i + 1}</span>
                <input className="ad-input" aria-label={`Step ${i + 1}`} value={step} placeholder={`Step ${i + 1}`}
                       onChange={e => updateStep(i, e.target.value)} />
                {form.steps.length > 1 && (
                  <button type="button" className="ad-icon-btn" aria-label={`Remove step ${i + 1}`} onClick={() => removeStep(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={addStep}>+ Add step</button>
          </div>
        </Field>
        <Field label="Campaign image / logo" span={1}>
          <ImageUpload value={form.imageUrl} onChange={url => set('imageUrl', url)} path="community/image" />
        </Field>
        <Field label="Image card background" span={1} htmlFor="cm-bg">
          <div className="ad-color">
            <input type="color" aria-label="Pick background colour" value={form.imageBg} onChange={e => set('imageBg', e.target.value)} />
            <input id="cm-bg" className="ad-input" value={form.imageBg} placeholder="#1e3a2f" onChange={e => set('imageBg', e.target.value)} />
          </div>
        </Field>
        <Field label="Link URL" tag="optional" span={1} htmlFor="cm-url">
          <input id="cm-url" className="ad-input" value={form.linkUrl} placeholder="https://kroger.com/…" onChange={e => set('linkUrl', e.target.value)} />
        </Field>
        <Field label="Link label" tag="optional" span={1} htmlFor="cm-ul">
          <input id="cm-ul" className="ad-input" value={form.linkLabel} placeholder="Learn More" onChange={e => set('linkLabel', e.target.value)} />
        </Field>
        <Field label="Downloadable file" tag="optional">
          <FileUpload value={form.fileUrl} onChange={url => set('fileUrl', url)} path="community/file" />
        </Field>
        {form.fileUrl && (
          <Field label="File button label" htmlFor="cm-fl">
            <input id="cm-fl" className="ad-input" value={form.fileLabel} placeholder="Download Info Sheet" onChange={e => set('fileLabel', e.target.value)} />
          </Field>
        )}
      </EditorPanel>
    );

  return (
    <div className="ad-screen">
      <PageHead title="Community" sub="Campaign blocks on the public site. More than one becomes a slider. Arrows reorder and save right away." />
      <SplitLayout
        countLabel={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
        addLabel="Add campaign" onAdd={openAdd}
        list={campaigns.length === 0
          ? <EmptyState title="No campaigns yet" sub="Add the first community campaign." />
          : campaigns.map((c, i) => (
            <ListRow key={c.id} title={c.headline} sub={`${c.steps?.length || 0} steps`}
                     thumb={{ kind: 'campaign', src: c.imageUrl, bg: c.imageBg || '#1e3a2f' }}
                     selected={sel === c.id} onSelect={() => openEdit(c)}
                     onUp={() => swap(c, -1)} onDown={() => swap(c, 1)}
                     upDisabled={i === 0} downDisabled={i === campaigns.length - 1} />
          ))}
        editor={editor}
      />
    </div>
  );
}
