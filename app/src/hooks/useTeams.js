import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useTeams() {
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'teams'), snap => {
      const data = {};
      snap.forEach(d => { data[d.id] = { id: d.id, ...d.data() }; });
      setTeams(data);
      setLoading(false);
    }, (err) => { console.error('Firestore error:', err); setLoading(false); });
    return unsub;
  }, []);

  async function saveTeam(id, data) {
    await setDoc(doc(db, 'teams', id), data, { merge: true });
  }

  async function updateTeamField(id, field, value) {
    await updateDoc(doc(db, 'teams', id), { [field]: value });
  }

  async function deleteTeam(id) {
    await deleteDoc(doc(db, 'teams', id));
  }

  return { teams, loading, saveTeam, updateTeamField, deleteTeam };
}
