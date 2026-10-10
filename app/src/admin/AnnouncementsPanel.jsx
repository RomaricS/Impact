import { useState, useEffect, useRef } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAnnouncements } from '../hooks/useAnnouncements';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import { SplitLayout, ListRow, EditorPanel, ConfirmDelete, Field, PageHead, EmptyState, Chip } from './ui';

const TAGS = ['Announcement', 'Signing', 'Tournament', 'Award'];
const TAG_TONE = { Signing: 'pink', Tournament: 'blue', Announcement: 'neutral', Award: 'warm' };
const EMPTY_FORM = { title: '', body: '', tag: 'Announcement', photoUrl: '', linkUrl: '', linkLabel: '', date: '', fileUrl: '', fileLabel: '' };

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsPanel({ toast }) {
  const { announcements } = useAnnouncements(100);
  const [sel, setSel] = useState(null); // id | 'new' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [localList, setLocalList] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
     
    if (!isDirtyRef.current) setLocalList(announcements);
  }, [announcements]);

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= localList.length) return;
    const next = [...localList];
    [next[i], next[j]] = [next[j], next[i]];
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
      await Promise.all(localList.map((post, i) =>
        setDoc(doc(db, 'announcements', post.id), { sort: i + 1 }, { merge: true })));
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
    setSel('new');
  }

  function openEdit(post) {
    // eslint-disable-next-line no-unused-vars
    const { id, createdAt, ...rest } = post;
    setForm({ ...EMPTY_FORM, ...rest });
    setSel(id);
  }

  async function save() {
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    if (!form.body.trim())  { toast('Body is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, createdAt: Timestamp.now() };
      if (sel !== 'new') {
        await setDoc(doc(db, 'announcements', sel), payload);
      } else {
        const r = await addDoc(collection(db, 'announcements'), { ...payload, sort: 0 });
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
      await deleteDoc(doc(db, 'announcements', id));
      setSel(null);
      toast('Deleted ✓');
    } catch {
      toast('Delete failed', 'error');
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isNew = sel === 'new';

  const editor = sel === null
    ? <EmptyState title="Select a post" sub="Pick a post on the left to edit it, or write a new one." onAdd={openAdd} addLabel="New post" />
    : (
      <EditorPanel key={sel} title={isNew ? 'New post' : 'Edit post'} meta={isNew ? 'New' : form.title}
                   onSave={save} onCancel={() => setSel(null)} saveLabel={isNew ? 'Publish post' : 'Save changes'} saving={saving}
                   deleteSlot={!isNew && <ConfirmDelete noun="post" onConfirm={() => remove(sel)} />}>
        <Field label="Title" tag="required" htmlFor="an-title">
          <input id="an-title" className="ad-input" value={form.title} placeholder="Emma Johnson Signs with Purdue University" onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Body" tag="required" htmlFor="an-body">
          <textarea id="an-body" className="ad-input ad-textarea" rows={5} value={form.body} onChange={e => set('body', e.target.value)} />
        </Field>
        <Field label="Tag" span={1} htmlFor="an-tag">
          <select id="an-tag" className="ad-input" value={form.tag} onChange={e => set('tag', e.target.value)}>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Display date" span={1} hint="A label, typed as you want it shown." htmlFor="an-date">
          <input id="an-date" className="ad-input" value={form.date} placeholder="Apr 18, 2026" onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Photo" tag="optional">
          <ImageUpload value={form.photoUrl} onChange={url => set('photoUrl', url)} path="announcements/photo" />
        </Field>
        <Field label="Link URL" tag="optional" span={1} htmlFor="an-url">
          <input id="an-url" className="ad-input" value={form.linkUrl} placeholder="https://" onChange={e => set('linkUrl', e.target.value)} />
        </Field>
        <Field label="Link label" tag="optional" span={1} htmlFor="an-ul">
          <input id="an-ul" className="ad-input" value={form.linkLabel} placeholder="Read more" onChange={e => set('linkLabel', e.target.value)} />
        </Field>
        <Field label="Downloadable file" tag="optional">
          <FileUpload value={form.fileUrl} onChange={url => set('fileUrl', url)} path="announcements/file" />
        </Field>
        {form.fileUrl && (
          <Field label="File button label" htmlFor="an-fl">
            <input id="an-fl" className="ad-input" value={form.fileLabel} placeholder="Download Flyer" onChange={e => set('fileLabel', e.target.value)} />
          </Field>
        )}
      </EditorPanel>
    );

  return (
    <div className="ad-screen">
      <PageHead title="Announcements" sub="Posts in “Latest updates”. Reorder with the arrows, then save the order. New posts start at the top." />
      <SplitLayout
        countLabel={`${localList.length} post${localList.length === 1 ? '' : 's'}`}
        addLabel="New post" onAdd={openAdd}
        before={
          <div className={`ad-order-bar ${isDirty ? 'is-open' : ''}`} aria-hidden={!isDirty}>
            <span>Order changed. Not saved yet.</span>
            <button type="button" className="ad-btn ad-btn-sm ad-btn-on-ink" onClick={resetOrder} tabIndex={isDirty ? 0 : -1}>Reset</button>
            <button type="button" className="ad-btn ad-btn-sm ad-btn-on-ink-primary" onClick={saveOrder} disabled={savingOrder} tabIndex={isDirty ? 0 : -1}>
              {savingOrder ? 'Saving…' : 'Save order'}
            </button>
          </div>
        }
        list={localList.length === 0
          ? <EmptyState title="No posts yet" sub="Write the first post for Latest updates." />
          : localList.map((post, i) => (
            <ListRow key={post.id} title={post.title} sub={post.date}
                     thumb={{ kind: 'photo', src: post.photoUrl }}
                     chips={[<Chip key="t" tone={TAG_TONE[post.tag] || 'neutral'}>{post.tag}</Chip>]}
                     selected={sel === post.id} onSelect={() => openEdit(post)}
                     onUp={() => move(i, -1)} onDown={() => move(i, 1)}
                     upDisabled={i === 0} downDisabled={i === localList.length - 1} />
          ))}
        editor={editor}
      />
    </div>
  );
}
