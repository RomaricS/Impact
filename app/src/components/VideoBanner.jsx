export default function VideoBanner() {
  return (
    <div className="video-banner">
      <video autoPlay muted loop playsInline preload="none" src="https://firebasestorage.googleapis.com/v0/b/impact-4dd83.firebasestorage.app/o/vid.mov?alt=media" />
      <div className="video-overlay" />
      <div className="video-content">
        <div className="eyebrow">Impact Legends · In Action</div>
        <h2>Where Champions<br />Are Made</h2>
        <p>Six teams. Hundreds of hours on the court. One relentless pursuit of excellence.</p>
      </div>
    </div>
  );
}
