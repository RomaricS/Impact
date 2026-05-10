import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useAnnouncements(max = 10) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), limit(100));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const as = a.sort ?? 0;
        const bs = b.sort ?? 0;
        if (as !== bs) return as - bs;
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
      setAnnouncements(docs.slice(0, max));
      setLoading(false);
    });
    return unsub;
  }, [max]);

  return { announcements, loading };
}
