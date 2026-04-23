import content from '../content.json';

export default function VideoBanner() {
  return (
    <div className="video-banner">
      <video autoPlay muted loop playsInline preload="none" src="/assets/vid.mp4" />
      <div className="video-overlay" />
      <div className="video-content">
        <div className="eyebrow">{content.videoBanner.eyebrow}</div>
        <h2>{content.videoBanner.titleLine1}<br />{content.videoBanner.titleLine2}</h2>
        <p>{content.videoBanner.subtitle}</p>
      </div>
    </div>
  );
}
