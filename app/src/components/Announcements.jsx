import { useReveal } from '../hooks/useReveal';
import { useAnnouncements } from '../hooks/useAnnouncements';
import content from '../content.json';

const TAG_EMOJI = { Signing: '🎓', Tournament: '🏆', Announcement: '📋', Award: '🏅' };

export default function Announcements() {
  const { announcements, loading } = useAnnouncements(10);
  const ref = useReveal([loading, announcements.length]);

  if (!loading && announcements.length === 0) return null;

  return (
    <section className="sec announcements-sec" id="news" ref={ref}>
      <div className="container">
        <div className="rv">
          <div className="sec-eye">{content.announcements.eyebrow}</div>
          <h2 className="sec-title">{content.announcements.titlePlain} <span style={{ color: 'var(--pink)' }}>{content.announcements.titleHighlight}</span></h2>
          <p className="sec-sub">{content.announcements.subtitle}</p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading…</p>
        ) : (
          <div className="ann-feed rv">
            {announcements.map(post => (
              <div key={post.id} className="ann-item">
                <div className="ann-dot">{TAG_EMOJI[post.tag] || '📢'}</div>
                <div className="ann-card">
                  {post.photoUrl && <img src={post.photoUrl} alt="" className="ann-photo" />}
                  <div className="ann-body">
                    <h3 className="ann-title">{post.title}</h3>
                    <p className="ann-text">{post.body}</p>
                    <div className="ann-meta">
                      <span className="ann-date">{post.date}</span>
                      <span className="ann-tag">{post.tag}</span>
                    </div>
                    {post.linkUrl && (
                      <a href={post.linkUrl} target="_blank" rel="noreferrer" className="ann-link">
                        {post.linkLabel || content.announcements.defaultLinkLabel} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
