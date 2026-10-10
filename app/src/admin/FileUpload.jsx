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

  const ext = value ? (fileName(value).split('.').pop() || 'file').toUpperCase().slice(0, 4) : 'FILE';

  return (
    <div className="file-upload">
      <span className="ad-file-badge">{ext}</span>
      <span className="ad-file-name">{value ? fileName(value) : 'No file attached'}</span>
      <input ref={inputRef} type="file" hidden onChange={handleFile} />
      {value && <a href={value} target="_blank" rel="noreferrer" className="ad-btn ad-btn-ghost ad-btn-sm">View</a>}
      <button type="button" className="ad-btn ad-btn-outline ad-btn-sm"
              onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading…' : value ? 'Replace' : 'Choose'}
      </button>
      {value && <button type="button" className="ad-icon-btn" aria-label="Remove file" onClick={() => onChange('')}>✕</button>}
    </div>
  );
}
