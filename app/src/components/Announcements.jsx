import { useReveal } from '../hooks/useReveal';
import { useAnnouncements } from '../hooks/useAnnouncements';
import content from '../content.json';

const TAG_CLASS = {
  Signing: 'ann-tag-signing',
  Tournament: 'ann-tag-tournament',
  Announcement: 'ann-tag-announcement',
  Award: 'ann-tag-award',
};

function TagPill({ tag }) {
  return <span className={`ann-tag ${TAG_CLASS[tag] || 'ann-tag-announcement'}`}>{tag}</span>;
}

function PostActions({ post }) {
  if (!post.linkUrl && !post.fileUrl) return null;
  return (
    <div className="ann-actions">
      {post.linkUrl && (
        <a href={post.linkUrl} target="_blank" rel="noreferrer" className="ann-link">
          {post.linkLabel || content.announcements.defaultLinkLabel}
          <span className="ann-arrow" aria-hidden="true">→</span>
        </a>
      )}
      {post.fileUrl && (
        <a href={post.fileUrl} target="_blank" rel="noreferrer" className="ann-link">
          {post.fileLabel || 'Download'}
        </a>
      )}
    </div>
  );
}

export default function Announcements() {
  const { announcements, loading } = useAnnouncements(10);
  const ref = useReveal([loading, announcements.length]);

  if (!loading && announcements.length === 0) return null;

  const [lead, ...rest] = announcements;

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
            <article className="ann-card ann-card-lg">
              {lead.photoUrl && <img src={lead.photoUrl} alt="" className="ann-photo" />}
              <div className="ann-body">
                <div className="ann-meta">
                  <TagPill tag={lead.tag} />
                  <span className="ann-date">{lead.date}</span>
                </div>
                <h3 className="ann-title">{lead.title}</h3>
                <p className="ann-text">{lead.body}</p>
                <PostActions post={lead} />
              </div>
            </article>

            {rest.length > 0 && (
              <div className="ann-stack">
                {rest.map(post => (
                  <article key={post.id} className="ann-card ann-card-sm">
                    <div className="ann-meta">
                      <TagPill tag={post.tag} />
                      <span className="ann-date">{post.date}</span>
                    </div>
                    <h3 className="ann-title">{post.title}</h3>
                    <p className="ann-text">{post.body}</p>
                    <PostActions post={post} />
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
