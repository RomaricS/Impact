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
        ? <img src={value} className={`img-upload-preview ${cls}`} alt="preview" />
        : <div className={`img-upload-placeholder ${cls}`}>📷</div>
      }
      <div className="img-upload-row">
        <input ref={inputRef} type="file" accept="image/*" className="img-upload-input" onChange={handleFile} />
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? '' : '↑ Upload'}
        </button>
        {uploading && <span className="img-uploading">Uploading…</span>}
        {value && !uploading && (
          <button type="button" className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => onChange('')}>✕</button>
        )}
      </div>
    </div>
  );
}
