import { useEffect } from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import Stats from '../components/Stats';
import Announcements from '../components/Announcements';
import Teams from '../components/Teams';
import Tryouts from '../components/Tryouts';
import Programs from '../components/Programs';
import Fees from '../components/Fees';
import Sponsors from '../components/Sponsors';
import Community from '../components/Community';
import Footer from '../components/Footer';
import { useTeams } from '../hooks/useTeams';

export default function Home({ theme, toggleTheme }) {
  const { teams, loading } = useTeams();

  useEffect(() => {
    if (loading || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [loading]);

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <Ticker />
      <Stats />
      <Announcements />
      <Teams teams={teams} loading={loading} />
      <Tryouts />
      <Programs />
      <Fees />
      <Sponsors />
      <Community />
      <Footer />
    </>
  );
}
