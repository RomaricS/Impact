import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_LINK = 'https://forms.gle/bZdUaRmFzXLsSxpy7';

export function useSettings() {
  const [settings, setSettings] = useState({ registrationLink: DEFAULT_LINK });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), snap => {
      if (snap.exists() && snap.data().registrationLink) {
        setSettings({ registrationLink: snap.data().registrationLink });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { settings, loading };
}
