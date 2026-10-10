import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useCommunity } from '../hooks/useCommunity';
import content from '../content.json';

export default function Community() {
  const { campaigns, loading } = useCommunity();
  const ref = useReveal([loading]);
  const [activeIdx, setActiveIdx] = useState(0);

  if (loading || campaigns.length === 0) return null;

  const idx = Math.min(activeIdx, campaigns.length - 1);
  const c = campaigns[idx];
  const multi = campaigns.length > 1;

  return (
    <section className="sec community-sec" id="community" ref={ref}>
      <div className="container">
        <div className="comm-panel rv">
          <div className="comm-left">
            <div className="comm-eye">{content.community.eyebrow}</div>
            <h2 className="comm-headline">{c.headline}</h2>
            {c.description && <p className="comm-desc">{c.description}</p>}
            {c.steps?.length > 0 && (
              <ol className="comm-steps">
                {c.steps.map((step, i) => (
                  <li key={i}>
                    <span className="comm-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="comm-actions">
              <div className="comm-links">
                {c.linkUrl && (
                  <a href={c.linkUrl} target="_blank" rel="noreferrer" className="comm-btn">
                    {c.linkLabel || content.community.defaultLinkLabel} <span className="btn-arrow" aria-hidden="true">→</span>
                  </a>
                )}
                {c.fileUrl && (
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="comm-file">
                    {c.fileLabel || 'Download'} ↓
                  </a>
                )}
              </div>
              {multi && (
                <div className="comm-controls">
                  <button type="button" className="comm-arrow" aria-label="Previous campaign"
                          onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>←</button>
                  <span className="comm-count">{idx + 1} / {campaigns.length}</span>
                  <button type="button" className="comm-arrow" aria-label="Next campaign"
                          onClick={() => setActiveIdx(i => Math.min(campaigns.length - 1, i + 1))}
                          disabled={idx === campaigns.length - 1}>→</button>
                </div>
              )}
            </div>
          </div>

          {c.imageUrl && (
            <div className="comm-img-card" style={{ background: c.imageBg || '#1e3a2f' }}>
              <img src={c.imageUrl} alt={c.headline} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
