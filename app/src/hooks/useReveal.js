import { useEffect, useRef } from 'react';

export function useReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('.rv:not(.in)');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
