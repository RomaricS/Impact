import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const HARDCODED_TIERS = [
  {
    tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0,
    sponsors: [
      { id: 'hc-0', logo: 'https://static.wixstatic.com/media/bece4b_c80545f3bd9a49c9ae23d08054cd55d0~mv2.png', addr: '5825 Covington Rd, Fort Wayne, IN 46804', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 0 },
      { id: 'hc-1', logo: 'https://static.wixstatic.com/media/bece4b_fef4f5367f6645f589c4b529e66591ae~mv2.png', addr: '243 Airport North Office Park, Fort Wayne, IN 46825', tierLabel: 'Kill Level', tierAmount: '$1,000+', tierOrder: 0, order: 1 },
    ],
  },
  {
    tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1,
    sponsors: [
      { id: 'hc-2', logo: 'https://static.wixstatic.com/media/bece4b_c95f00c14b8b4d22875727781ff15a26~mv2.jpeg', addr: '6906 Ardmore Ave, Fort Wayne, IN 46809', tierLabel: 'Ace Level', tierAmount: '$500–$999', tierOrder: 1, order: 0 },
    ],
  },
  {
    tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2,
    sponsors: [
      { id: 'hc-3', logo: 'https://static.wixstatic.com/media/bece4b_5527b50f43fb4558b1b1da737dfe75c0~mv2.png', addr: '7908 Carnegie Blvd, Fort Wayne, IN 46804', tierLabel: 'Block Level', tierAmount: '$250–$499', tierOrder: 2, order: 0 },
    ],
  },
];

export function useSponsors() {
  const [tiers, setTiers] = useState(HARDCODED_TIERS);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sponsors'), orderBy('tierOrder'));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const flat = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSponsors(flat);
        const grouped = new Map();
        for (const s of flat) {
          if (!grouped.has(s.tierLabel)) {
            grouped.set(s.tierLabel, {
              tierLabel: s.tierLabel,
              tierAmount: s.tierAmount,
              tierOrder: s.tierOrder ?? 0,
              sponsors: [],
            });
          }
          grouped.get(s.tierLabel).sponsors.push(s);
        }
        const sorted = [...grouped.values()].sort((a, b) => a.tierOrder - b.tierOrder);
        sorted.forEach(t => t.sponsors.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setTiers(sorted);
      } else {
        setTiers(HARDCODED_TIERS);
        setSponsors([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { tiers, sponsors, loading };
}
