import { useEffect, useRef, useState } from 'react';
import content from '../content.json';

const STATS = content.hero.stats;

// Stats whose value starts with digits (e.g. "50+", "2026") get the leading
// integer counted up; the suffix (e.g. "+") is captured separately and left
// untouched. A stat with no leading digit (e.g. "FW") doesn't match and is
// rendered as a plain static string.
const LEADING_INT = /^(\d+)(.*)$/;

export default function Stats() {
  const ref = useRef(null);
  // Eased 0..1 fraction of the count-up. Starts at 1 (fully counted) so
  // cells show their final value until the section is actually observed
  // scrolling into view, at which point it's reset to 0 and animated back
  // up — mirrors the `k` default in design/source/Admin.dc.html.
  const [progress, setProgress] = useState(1);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    // Respect reduced motion exactly like the componentDidMount reference:
    // bail out before ever touching progress, so cells just show final values.
    if (prefersReducedMotion) return;

    const node = ref.current;
    if (!node) return;

    let raf = null;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || startedRef.current) return;
        // Replay guard: mark as started and stop observing immediately so
        // scrolling away and back never re-triggers the count-up.
        startedRef.current = true;
        obs.unobserve(entry.target);

        setProgress(0);
        let start = null;
        function step(ts) {
          if (start === null) start = ts;
          const k = Math.min(1, (ts - start) / 1100);
          setProgress(1 - Math.pow(1 - k, 3));
          if (k < 1) raf = requestAnimationFrame(step);
        }
        raf = requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });

    obs.observe(node);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="stats-sec" ref={ref}>
      <div className="stats-grid">
        {STATS.map(stat => {
          const match = LEADING_INT.exec(stat.num);
          let display = stat.num;
          if (match) {
            const target = parseInt(match[1], 10);
            const suffix = match[2];
            display = `${Math.round(target * progress)}${suffix}`;
          }
          return (
            <div className="stats-cell" key={stat.lbl}>
              <div className="stats-num" style={match ? { fontVariantNumeric: 'tabular-nums' } : undefined}>
                {display}
              </div>
              <div className="stats-lbl">{stat.lbl}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
