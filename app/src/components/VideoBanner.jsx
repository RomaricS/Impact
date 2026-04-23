import content from '../content.json';

const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const videoSrc = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/vid.mov?alt=media`;

export default function VideoBanner() {
  return (
    <div className="video-banner">
      <video autoPlay muted loop playsInline preload="none" src={videoSrc} />
      <div className="video-overlay" />
      <div className="video-content">
        <div className="eyebrow">{content.videoBanner.eyebrow}</div>
        <h2>{content.videoBanner.titleLine1}<br />{content.videoBanner.titleLine2}</h2>
        <p>{content.videoBanner.subtitle}</p>
      </div>
    </div>
  );
}
