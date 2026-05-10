import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useCommunity } from '../hooks/useCommunity';
import content from '../content.json';

export default function Community() {
  const { campaigns, loading } = useCommunity();
  const ref = useReveal([loading]);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!loading && campaigns.length === 0) return null;
  if (loading) return null;

  const idx = Math.min(activeIdx, campaigns.length - 1);
  const c = campaigns[idx];
  const multi = campaigns.length > 1;

  return (
    <section className="sec community-sec" ref={ref}>
      <div className="container">
        <div className="comm-grid rv">
          {/* Left column */}
          <div className="comm-left">
            <div className="sec-eye">{content.community.eyebrow}</div>
            <h2 className="comm-headline">{c.headline}</h2>
            {c.description && <p className="comm-desc">{c.description}</p>}
            {c.steps?.length > 0 && (
              <ol className="comm-steps">
                {c.steps.map((step, i) => (
                  <li key={i} className="comm-step">
                    <span className="comm-step-num">{i + 1}</span>
                    <span className="comm-step-text">{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {c.linkUrl && (
              <a href={c.linkUrl} target="_blank" rel="noreferrer"
                 className="btn btn-p" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                {c.linkLabel || content.community.defaultLinkLabel} →
              </a>
            )}
          </div>

          {/* Right column */}
          {(c.imageUrl || c.fileUrl) && (
            <div className="comm-right">
              {c.imageUrl && (
                <div className="comm-img-card" style={{ background: c.imageBg || '#1e3a2f' }}>
                  <img src={c.imageUrl} alt={c.headline} />
                </div>
              )}
              {c.fileUrl && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="ann-file-btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3v13M5 15l7 7 7-7"/><line x1="3" y1="22" x2="21" y2="22"/>
                    </svg>
                    {c.fileLabel || 'Download'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slider controls — only shown for 2+ campaigns */}
        {multi && (
          <div className="comm-controls">
            <button className="comm-arrow"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                    disabled={activeIdx === 0}>‹</button>
            <div className="comm-dots">
              {campaigns.map((_, i) => (
                <button key={i}
                        className={`comm-dot ${i === idx ? 'on' : ''}`}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setActiveIdx(i)} />
              ))}
            </div>
            <button className="comm-arrow"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setActiveIdx(i => Math.min(campaigns.length - 1, i + 1))}
                    disabled={activeIdx === campaigns.length - 1}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}
