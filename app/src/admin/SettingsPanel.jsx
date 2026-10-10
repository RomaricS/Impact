import { useState, useRef, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { usePayments } from '../hooks/usePayments';
import { useSettings } from '../hooks/useSettings';
import ImageUpload from './ImageUpload';
import { PageHead } from './ui';

function Section({ title, help, danger, children }) {
  return (
    <section className={`ad-set ${danger ? 'is-danger' : ''}`}>
      <div className="ad-set-meta">
        <h2>{title}</h2>
        {help && <p>{help}</p>}
      </div>
      <div className="ad-set-body">{children}</div>
    </section>
  );
}

export default function SettingsPanel({ teams, toast }) {
  const importRef = useRef(null);
  const pdfRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const { qrs, pdfUrl } = usePayments();
  const [qrDraft, setQrDraft] = useState(null);
  const [savingQr, setSavingQr] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [currentPdf, setCurrentPdf] = useState('');
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrentPdf(pdfUrl); }, [pdfUrl]);
  const { settings } = useSettings();
  const [regLink, setRegLink] = useState('');
  const [savingReg, setSavingReg] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRegLink(settings.registrationLink); }, [settings.registrationLink]);

  async function saveRegLink() {
    setSavingReg(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), { registrationLink: regLink }, { merge: true });
      toast('Registration link saved ✓');
    } catch {
      toast('Save failed', 'error');
    } finally {
      setSavingReg(false);
    }
  }

  function openQrEditor() {
    setQrDraft(qrs.map(q => ({ ...q })));
  }

  function updateQrField(i, field, value) {
    setQrDraft(d => d.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  async function saveQrs() {
    setSavingQr(true);
    try {
      await setDoc(doc(db, 'settings', 'payments'), { qr: qrDraft });
      toast('Payment QR codes saved ✓');
      setQrDraft(null);
    } catch (err) {
      console.error(err);
      toast('Save failed', 'error');
    } finally {
      setSavingQr(false);
    }
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') { toast('Please select a PDF file', 'error'); return; }
    setUploadingPdf(true);
    try {
      const storageRef = ref(storage, `fee-schedule-${Date.now()}.pdf`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'settings', 'payments'), { feeSchedulePdf: url }, { merge: true });
      setCurrentPdf(url);
      toast('Fee schedule PDF updated ✓');
    } catch (err) {
      console.error(err);
      toast('Upload failed', 'error');
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  }

  async function clearPdf() {
    await setDoc(doc(db, 'settings', 'payments'), { feeSchedulePdf: '' }, { merge: true });
    setCurrentPdf('');
    toast('PDF removed ✓');
  }

  function handleExport() {
    const clean = {};
    Object.entries(teams).forEach(([id, t]) => {
       
      const { id: _id, ...rest } = t;
      clean[id] = rest;
    });
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `impact-teams-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported ✓');
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await Promise.all(
        Object.entries(data).map(([id, team]) =>
          setDoc(doc(db, 'teams', id), team)
        )
      );
      toast('Imported successfully ✓');
    } catch (err) {
      console.error(err);
      toast('Import failed — check JSON format', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div className="ad-screen">
      <PageHead title="Settings" sub="Site configuration and data management." />

      <Section title="Tryout registration link" help={'The URL the "Register now" button in the Tryouts section points to.'}>
        <label className="ad-label" htmlFor="reg-url">Registration URL</label>
        <div className="ad-inline">
          <input id="reg-url" className="ad-input" value={regLink}
                 onChange={e => setRegLink(e.target.value)} placeholder="https://forms.gle/…" />
          <button type="button" className="ad-btn ad-btn-primary" onClick={saveRegLink} disabled={savingReg}>
            {savingReg ? 'Saving…' : 'Save link'}
          </button>
        </div>
      </Section>

      <Section title="Payment QR codes" help="QR images and account handles shown in Club fees. Changes appear immediately on the public site.">
        {!qrDraft ? (
          <>
            <div className="ad-qr-grid">
              {qrs.map((q, i) => (
                <div key={i} className="ad-qr-card">
                  <img src={q.src} alt="" className="ad-qr-img" />
                  <div><strong>{q.label}</strong><div className="ad-mono">{q.handle}</div><div className="ad-hint">{q.note}</div></div>
                </div>
              ))}
            </div>
            <button type="button" className="ad-btn ad-btn-ghost" onClick={openQrEditor}>Edit QR codes</button>
          </>
        ) : (
          <>
            <div className="ad-qr-grid">
              {qrDraft.map((q, i) => (
                <div key={i} className="ad-qr-card is-editing">
                  <strong>{q.label}</strong>
                  <ImageUpload value={q.src} onChange={url => updateQrField(i, 'src', url)} path={`qr/${q.cls}-${i}`} />
                  <label className="ad-label" htmlFor={`qr-h-${i}`}>Handle</label>
                  <input id={`qr-h-${i}`} className="ad-input" value={q.handle} onChange={e => updateQrField(i, 'handle', e.target.value)} />
                  <label className="ad-label" htmlFor={`qr-n-${i}`}>Note</label>
                  <input id={`qr-n-${i}`} className="ad-input" value={q.note} onChange={e => updateQrField(i, 'note', e.target.value)} />
                </div>
              ))}
            </div>
            <div className="ad-actions">
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setQrDraft(null)}>Cancel</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={saveQrs} disabled={savingQr}>
                {savingQr ? 'Saving…' : 'Save QR codes'}
              </button>
            </div>
          </>
        )}
      </Section>

      <Section title="Fee schedule PDF" help="A download button appears in the Club fees section when a PDF is on file.">
        {currentPdf ? (
          <div className="ad-file">
            <span className="ad-file-badge">PDF</span>
            <span className="ad-file-name">Fee schedule on file</span>
            <a href={currentPdf} target="_blank" rel="noreferrer" className="ad-btn ad-btn-ghost ad-btn-sm">View</a>
            <button type="button" className="ad-icon-btn" aria-label="Remove PDF" onClick={clearPdf}>✕</button>
          </div>
        ) : <p className="ad-hint">No PDF uploaded.</p>}
        <input ref={pdfRef} type="file" accept=".pdf,application/pdf" hidden onChange={handlePdfUpload} />
        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => pdfRef.current?.click()} disabled={uploadingPdf}>
          {uploadingPdf ? 'Uploading…' : currentPdf ? 'Replace PDF' : 'Upload PDF'}
        </button>
      </Section>

      <Section title="Team data backup" help="Download all team data as JSON, or restore from a previous export.">
        <div className="ad-card">
          <strong>Export</strong>
          <p className="ad-hint">Download every team (roster, schedule, practices, coaches) as a JSON file.</p>
          <button type="button" className="ad-btn ad-btn-primary" onClick={handleExport}>↓ Export teams.json</button>
        </div>
        <div className="ad-card is-danger">
          <strong>Import</strong>
          <p className="ad-hint">Upload a previously exported JSON file. <strong>This overwrites existing team data.</strong></p>
          <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={handleImport} />
          <button type="button" className="ad-btn ad-btn-danger-outline" onClick={() => importRef.current?.click()} disabled={importing}>
            {importing ? 'Importing…' : '↑ Import teams.json'}
          </button>
        </div>
      </Section>
    </div>
  );
}
