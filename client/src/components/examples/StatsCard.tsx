import StatsCard from '../StatsCard';
import { Cigarette } from 'lucide-react';

export default function StatsCardExample() {
  return <StatsCard title="Total Logged" value="42" icon={Cigarette} subtitle="All time" />;
}
