import { useState } from 'react';

export function Field({ label, tag, hint, span = 2, children, htmlFor }) {
  return (
    <div className="ad-field" style={{ gridColumn: span === 1 ? 'span 1' : '1 / -1' }}>
      <label className="ad-label" htmlFor={htmlFor}>
        {label}{tag && <span className="ad-tag">{tag}</span>}
      </label>
      {children}
      {hint && <div className="ad-hint">{hint}</div>}
    </div>
  );
}

export function ConfirmDelete({ onConfirm, noun = 'item', label = 'Delete…' }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return <button type="button" className="ad-link-danger" onClick={() => setAsking(true)}>{label}</button>;
  }
  return (
    <div className="ad-confirm" role="group" aria-label={`Confirm delete ${noun}`}>
      <span>Delete this {noun}?</span>
      <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setAsking(false)}>Keep</button>
      <button type="button" className="ad-btn ad-btn-danger ad-btn-sm"
              onClick={async () => { await onConfirm(); setAsking(false); }}>Delete</button>
    </div>
  );
}

export function Chip({ children, tone = 'neutral' }) {
  return <span className={`ad-chip ad-chip-${tone}`}>{children}</span>;
}

export function ListRow({ title, sub, chips = [], thumb, selected, onSelect, onUp, onDown, upDisabled, downDisabled }) {
  return (
    <div className={`ad-row ${selected ? 'is-selected' : ''}`}>
      {(onUp || onDown) && (
        <div className="ad-reorder">
          <button type="button" className="ad-arrow" aria-label={`Move ${title} up`} onClick={onUp} disabled={upDisabled}>↑</button>
          <button type="button" className="ad-arrow" aria-label={`Move ${title} down`} onClick={onDown} disabled={downDisabled}>↓</button>
        </div>
      )}
      <button type="button" className="ad-row-main" onClick={onSelect} aria-pressed={selected}>
        {thumb !== undefined && (
          <span className={`ad-thumb ad-thumb-${thumb.kind || 'photo'}`} style={thumb.bg ? { background: thumb.bg } : undefined}>
            {thumb.src ? <img src={thumb.src} alt="" /> : thumb.text}
          </span>
        )}
        <span className="ad-row-text">
          <strong>{title}</strong>
          {sub && <span>{sub}</span>}
        </span>
        {chips.length > 0 && <span className="ad-row-chips">{chips}</span>}
      </button>
    </div>
  );
}

export function SplitLayout({ countLabel, addLabel, onAdd, before, list, editor }) {
  return (
    <div className="ad-split">
      <div className="ad-split-list">
        <div className="ad-list-head">
          <span className="ad-count">{countLabel}</span>
          {onAdd && <button type="button" className="ad-btn ad-btn-primary" onClick={onAdd}>+ {addLabel}</button>}
        </div>
        {before}
        <div className="ad-rows">{list}</div>
      </div>
      <div className="ad-split-editor">{editor}</div>
    </div>
  );
}

export function EditorPanel({ title, meta, children, onSave, onCancel, saveLabel = 'Save changes', saving, deleteSlot }) {
  return (
    <form className="ad-editor" onSubmit={e => { e.preventDefault(); onSave(); }}>
      <div className="ad-editor-head">
        <h3>{title}</h3>
        {meta && <span className="ad-editor-meta">{meta}</span>}
      </div>
      <div className="ad-grid">{children}</div>
      <div className="ad-editor-foot">
        <div>{deleteSlot}</div>
        <div className="ad-actions">
          {onCancel && <button type="button" className="ad-btn ad-btn-ghost" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="ad-btn ad-btn-primary" disabled={saving}>{saving ? 'Saving…' : saveLabel}</button>
        </div>
      </div>
    </form>
  );
}

export function EmptyState({ title, sub, onAdd, addLabel }) {
  return (
    <div className="ad-empty">
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
      {onAdd && <button type="button" className="ad-btn ad-btn-ghost" onClick={onAdd}>+ {addLabel}</button>}
    </div>
  );
}

export function PageHead({ title, sub, action }) {
  return (
    <div className="ad-page-head">
      <div>
        <h1 className="ad-title">{title}</h1>
        {sub && <p className="ad-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// Generic list + editor for an array field (roster, tournaments, practices, coaches).
export function CollectionEditor({ items, onSave, noun, addLabel, empty, blank, normalize, sort, rowOf, renderFields, countNote }) {
  const [list, setList] = useState(items || []);
  const [sel, setSel] = useState(list.length ? 0 : 'new');
  const [form, setForm] = useState(list.length ? { ...blank(), ...list[0] } : blank());
  const [saving, setSaving] = useState(false);

  function select(i) {
    setSel(i);
    setForm(i === 'new' ? blank() : { ...blank(), ...list[i] });
  }

  async function persist(next) {
    setSaving(true);
    await onSave(next);
    setSaving(false);
  }

  async function save() {
    const item = normalize ? normalize(form) : { ...form };
    let next = sel === 'new' ? [...list, item] : list.map((x, i) => (i === sel ? item : x));
    if (sort) next = sort(next);
    setList(next);
    await persist(next);
    const idx = next.indexOf(item);
    setSel(idx);
    setForm({ ...blank(), ...item });
  }

  async function remove() {
    const next = list.filter((_, i) => i !== sel);
    setList(next);
    await persist(next);
    select(next.length ? 0 : 'new');
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const plural = list.length === 1 ? noun : `${noun}${noun.endsWith('h') ? 'es' : 's'}`;

  return (
    <SplitLayout
      countLabel={`${list.length} ${plural}${countNote || ''}`}
      addLabel={addLabel}
      onAdd={() => select('new')}
      list={list.length === 0
        ? <EmptyState title={empty.title} sub={empty.sub} />
        : list.map((it, i) => {
            const r = rowOf(it);
            return <ListRow key={i} {...r} selected={sel === i} onSelect={() => select(i)} />;
          })}
      editor={
        <EditorPanel
          key={sel}
          title={sel === 'new' ? addLabel : `Edit ${noun}`}
          meta={sel === 'new' ? 'New' : rowOf(list[sel]).title}
          onSave={save}
          onCancel={() => select(sel)}
          saveLabel={sel === 'new' ? addLabel : 'Save changes'}
          saving={saving}
          deleteSlot={sel !== 'new' && <ConfirmDelete noun={noun} onConfirm={remove} />}
        >
          {renderFields(form, set)}
        </EditorPanel>
      }
    />
  );
}
