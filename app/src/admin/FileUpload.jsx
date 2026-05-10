import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

function fileName(url) {
  try {
    const decoded = decodeURIComponent(new URL(url).pathname);
    const raw = decoded.split('/').pop();
    return raw.replace(/-\d{13}(\.\w+)$/, '$1');
  } catch {
    return 'File attached';
  }
}

export default function FileUpload({ value, onChange, path }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `${path}-${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--muted)' }}>
            📄 {fileName(value)}
          </span>
          <a href={value} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost admin-btn-sm">View</a>
          <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => onChange('')}>✕</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleFile} />
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : value ? '↑ Replace File' : '↑ Attach File'}
        </button>
      </div>
    </div>
  );
}
