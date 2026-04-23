import Nav from '../components/Nav';
import Hero from '../components/Hero';
import VideoBanner from '../components/VideoBanner';
import Teams from '../components/Teams';
import Tryouts from '../components/Tryouts';
import Programs from '../components/Programs';
import Fees from '../components/Fees';
import Sponsors from '../components/Sponsors';
import Footer from '../components/Footer';
import { useTeams } from '../hooks/useTeams';

export default function Home({ theme, toggleTheme }) {
  const { teams, loading } = useTeams();

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <VideoBanner />
      <Teams teams={teams} loading={loading} />
      <Tryouts />
      <Programs />
      <Fees />
      <Sponsors />
      <Footer />
    </>
  );
}
