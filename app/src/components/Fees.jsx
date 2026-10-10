import { useReveal } from '../hooks/useReveal';
import { usePayments } from '../hooks/usePayments';
import content from '../content.json';

export default function Fees() {
  const ref = useReveal();
  const { qrs, pdfUrl } = usePayments();

  return (
    <section className="sec fees-sec" id="fees" ref={ref}>
      <div className="container">
        <div className="fees-panel rv">
          <div className="fees-left">
            <div className="sec-eye">{content.fees.eyebrow}</div>
            <h2 className="sec-title">{content.fees.titleLine1} {content.fees.titleLine2}</h2>
            <p className="fees-sub">{content.fees.subtitle}</p>
            <ul className="fees-rules">
              {content.fees.rules.map(r => <li key={r.cls}>{r.text}</li>)}
              <li><strong>{content.fees.mailTitle}:</strong> {content.fees.mailAddress}</li>
            </ul>
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn-ink">
                2027 Fee Schedule (PDF) <span className="btn-arrow" aria-hidden="true">↓</span>
              </a>
            )}
          </div>

          <div className="fees-right">
            <div className="mono-label">{content.fees.qrTitle}</div>
            <div className="qr-grid">
              {qrs.map((q, i) => (
                <div key={i} className="qr-card">
                  <img className="qr-img" src={q.src} alt={`${q.label} QR code`} />
                  <div className="qr-info">
                    <div className="qr-name">{q.label}</div>
                    <div className="qr-handle">{q.handle}</div>
                    <div className="qr-note">{q.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="qr-instr">{content.fees.qrInstruction}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
