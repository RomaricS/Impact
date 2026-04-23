const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const videoSrc = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/vid.mov?alt=media`;

export default function VideoBanner() {
  return (
    <div className="video-banner">
      <video autoPlay muted loop playsInline preload="none" src={videoSrc} />
      <div className="video-overlay" />
      <div className="video-content">
        <div className="eyebrow">Impact Legends · In Action</div>
        <h2>Where Champions<br />Are Made</h2>
        <p>Six teams. Hundreds of hours on the court. One relentless pursuit of excellence.</p>
      </div>
    </div>
  );
}
