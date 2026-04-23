import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_QRS = [
  { label: 'Venmo',   cls: 'venmo',   src: '/assets/qr-venmo.png',        handle: '@Andrew-Achenbach-2',   note: 'No processing fee' },
  { label: 'PayPal',  cls: 'paypal',  src: '/assets/qr-paypal.png',       handle: '@legendssportsacademy', note: '+2% processing fee' },
  { label: 'CashApp', cls: 'cashapp', src: '/assets/qr-cashapp.png',      handle: '$acher01',              note: 'No processing fee' },
  { label: 'PayPal',  cls: 'paypal',  src: '/assets/qr-paypal-perso.png', handle: '@AndrewAchenbach',      note: 'Friends & Family only · no fee' },
];

export function usePayments() {
  const [qrs, setQrs] = useState(DEFAULT_QRS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'payments'), snap => {
      if (snap.exists() && snap.data().qr?.length) {
        setQrs(snap.data().qr);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { qrs, loading };
}
