import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useCommunity } from '../hooks/useCommunity';

export default function Community() {
  const ref = useReveal();
  const { campaigns, loading } = useCommunity();
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
            <div className="sec-eye">Community</div>
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
                {c.linkLabel || 'Learn More'} →
              </a>
            )}
          </div>

          {/* Right column */}
          <div className="comm-right">
            <div className="comm-img-card" style={{ background: c.imageBg || '#1e3a2f' }}>
              {c.imageUrl && <img src={c.imageUrl} alt={c.headline} />}
            </div>
          </div>
        </div>

        {/* Slider controls — only shown for 2+ campaigns */}
        {multi && (
          <div className="comm-controls">
            <button className="comm-arrow"
                    onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                    disabled={activeIdx === 0}>‹</button>
            <div className="comm-dots">
              {campaigns.map((_, i) => (
                <button key={i}
                        className={`comm-dot ${i === idx ? 'on' : ''}`}
                        onClick={() => setActiveIdx(i)} />
              ))}
            </div>
            <button className="comm-arrow"
                    onClick={() => setActiveIdx(i => Math.min(campaigns.length - 1, i + 1))}
                    disabled={activeIdx === campaigns.length - 1}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}
