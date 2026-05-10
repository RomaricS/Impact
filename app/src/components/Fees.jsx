import { useReveal } from '../hooks/useReveal';
import { usePayments } from '../hooks/usePayments';
import content from '../content.json';

export default function Fees() {
  const ref = useReveal();
  const { qrs, pdfUrl } = usePayments();

  return (
    <section className="sec fees-sec" id="fees" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">{content.fees.eyebrow}</div>
          <h2 className="sec-title">{content.fees.titleLine1}<br />{content.fees.titleLine2}</h2>
          <p className="sec-sub">{content.fees.subtitle}</p>
        </div>

        <div className="fees-grid">
          <div className="pay-card rv">
            <div className="pay-card-title">{content.fees.waysToPayTitle}</div>
            <div className="pay-methods">
              {content.fees.methods.map(m => (
                <span key={m.label} className={`pay-pill ${m.cls}`}>{m.label}</span>
              ))}
            </div>

            <div className="pay-rules">
              {content.fees.rules.map(r => (
                <div key={r.cls} className="pay-rule">
                  <div className={`pay-rule-icon ${r.cls}`}>{r.icon}</div>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>

            <div className="check-box">
              <strong>{content.fees.mailTitle}</strong>
              {content.fees.mailAddress}
            </div>

            {pdfUrl && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '0.9rem' }}>
                  Full breakdown of team costs and monthly payment installments for the 2027 season.
                </div>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-p">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M12 3v13M5 15l7 7 7-7"/><line x1="3" y1="22" x2="21" y2="22"/>
                  </svg>
                  2027 Fee Schedule
                </a>
              </div>
            )}
          </div>

          <div className="qr-card rv" style={{ animationDelay: '0.15s' }}>
            <div className="pay-card-title">{content.fees.qrTitle}</div>
            <div className="qr-row">
              {qrs.map((q, i) => (
                <div key={i} className="qr-item">
                  <span className={`qr-logo ${q.cls}`}>{q.label}</span>
                  <img className="qr-img" src={q.src} alt={`${q.label} QR code`} />
                  <div className="qr-note">
                    <strong>{q.handle}</strong><br />{q.note}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.6, paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
              {content.fees.qrInstruction}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
