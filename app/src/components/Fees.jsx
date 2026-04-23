import { useReveal } from '../hooks/useReveal';
import { usePayments } from '../hooks/usePayments';

export default function Fees() {
  const ref = useReveal();
  const { qrs } = usePayments();

  return (
    <section className="sec fees-sec" id="fees" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">Club Fees</div>
          <h2 className="sec-title">Payment<br />Info</h2>
          <p className="sec-sub">Multiple payment options available. Always include your player name and team in the note.</p>
        </div>

        <div className="fees-grid">
          <div className="pay-card rv">
            <div className="pay-card-title">Ways to Pay</div>
            <div className="pay-methods">
              {[
                { label: 'Venmo', cls: 'free' },
                { label: 'PayPal Personal', cls: 'free' },
                { label: 'CashApp', cls: 'free' },
                { label: 'PayPal Business', cls: 'fee' },
                { label: 'Check', cls: '' },
                { label: 'Cash', cls: '' },
              ].map(m => (
                <span key={m.label} className={`pay-pill ${m.cls}`}>{m.label}</span>
              ))}
            </div>

            <div className="pay-rules">
              <div className="pay-rule">
                <div className="pay-rule-icon rule-due">📅</div>
                <span>Fees are due by the first practice of each month.</span>
              </div>
              <div className="pay-rule">
                <div className="pay-rule-icon rule-late">⚠</div>
                <span>A $25 late fee applies after 5 days past the due date.</span>
              </div>
              <div className="pay-rule">
                <div className="pay-rule-icon rule-check">✉</div>
                <span>Checks payable to <strong>Legends Sports Academy</strong></span>
              </div>
            </div>

            <div className="check-box">
              <strong>Mail / Drop-off Address</strong>
              2525 Florida Drive, Fort Wayne, IN 46805
            </div>
          </div>

          <div className="qr-card rv" style={{ animationDelay: '0.15s' }}>
            <div className="pay-card-title">Scan to Pay</div>
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
              Scan with your phone camera or app. Always include your{' '}
              <strong style={{ color: 'var(--fg)' }}>player name</strong> in the payment note.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
