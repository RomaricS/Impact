import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function ImageUpload({ value, onChange, path, portrait = false }) {
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
    }
  }

  const cls = portrait ? 'portrait' : '';

  return (
    <div className="img-upload-wrap">
      {value
        ? <img src={value} className={`img-upload-preview ${cls}`} alt="" />
        : <div className={`img-upload-placeholder ${cls}`}>None</div>
      }
      <span className="img-upload-note">{uploading ? 'Uploading…' : portrait ? 'Portrait crop' : 'JPG, PNG or WebP'}</span>
      <input ref={inputRef} type="file" accept="image/*" className="img-upload-input" onChange={handleFile} />
      <button type="button" className="ad-btn ad-btn-outline ad-btn-sm"
              onClick={() => inputRef.current?.click()} disabled={uploading}>
        {value ? 'Replace' : 'Upload'}
      </button>
      {value && !uploading && (
        <button type="button" className="ad-icon-btn" aria-label="Clear image" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  );
}
