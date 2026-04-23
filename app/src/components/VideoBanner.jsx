export default function VideoBanner() {
  return (
    <div className="video-banner">
      <video autoPlay muted loop playsInline preload="none" src="/assets/vid.mov" />
      <div className="video-overlay" />
      <div className="video-content">
        <div className="eyebrow">Impact Legends · In Action</div>
        <h2>Where Champions<br />Are Made</h2>
        <p>Six teams. Hundreds of hours on the court. One relentless pursuit of excellence.</p>
      </div>
    </div>
  );
}
