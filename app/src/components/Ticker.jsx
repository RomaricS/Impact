const WORDS = [
  'Tryouts open',
  '12U – 18U',
  'Fort Wayne, Indiana',
  'Six teams',
  '2026–27 season',
  'Est. 2022',
];

// Decorative marquee band reintroduced below the hero. Purely visual — no
// data source — so the words are hard-coded to match the design reference.
// Rendered twice back-to-back and animated by translateX(-50%) so the loop
// is seamless; aria-hidden since it repeats info already on the page.
export default function Ticker() {
  const items = [...WORDS, ...WORDS];

  return (
    <div className="ticker-clip">
      <div className="ticker-band" aria-hidden="true">
        <div className="ticker-track">
          {items.map((word, i) => (
            <span className="ticker-item" key={i}>
              {word}
              <span
                className="ticker-dot"
                style={{ background: i % 2 === 0 ? 'var(--dot1)' : 'var(--dot2)' }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
