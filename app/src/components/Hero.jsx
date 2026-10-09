import { useEffect, useRef, useState } from 'react';
import content from '../content.json';

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="3" y="2" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M5 2.5L15.5 9 5 15.5V2.5z" fill="currentColor" />
    </svg>
  );
}

export default function Hero() {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [isPaused, setIsPaused] = useState(() => prefersReducedMotion);

  useEffect(() => {
    // Belt-and-suspenders: the autoPlay attribute is already omitted when
    // prefers-reduced-motion is set, but explicitly pausing covers browsers
    // that start loading/playing before React attaches the ref.
    if (prefersReducedMotion) {
      videoRef.current?.pause();
    }
    // Only needs to run once on mount — the OS-level preference doesn't change mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }

  return (
    <section className="hero" id="about">
      <div className="eyebrow">{content.hero.eyebrow}</div>
      <h1>
        {content.hero.titleLine1} <span className="pink">{content.hero.titleLine2}</span>
      </h1>

      <div className="hero-row">
        <p className="hero-sub">{content.hero.subtitle}</p>
        <div className="cta-row">
          <a href="#tryouts" className="btn btn-p"
             onClick={e => { e.preventDefault(); document.getElementById('tryouts')?.scrollIntoView({ behavior: 'smooth' }); }}>
            {content.hero.ctaPrimary}
          </a>
          <a href="#teams" className="btn btn-g"
             onClick={e => { e.preventDefault(); document.getElementById('teams')?.scrollIntoView({ behavior: 'smooth' }); }}>
            {content.hero.ctaSecondary}
          </a>
        </div>
      </div>

      <div className="hero-video">
        {videoFailed ? (
          <div className="hero-video-fallback" aria-hidden="true" />
        ) : (
          <video
            ref={videoRef}
            src="/assets/vid.mp4"
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="hero-video-scrim" aria-hidden="true" />
        <div className="hero-video-progress" aria-hidden="true" />
        <div className="hero-video-bar">
          <div className="hero-video-caption">
            <span className="hero-video-dot" aria-hidden="true" />
            Impact Legends in action
          </div>
          <button
            type="button"
            className="hero-video-pause"
            onClick={togglePause}
            aria-label={isPaused ? 'Play video' : 'Pause video'}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}
