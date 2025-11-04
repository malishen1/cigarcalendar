import ReleaseCard from '../ReleaseCard';

export default function ReleaseCardExample() {
  const release = {
    id: '1',
    name: 'Davidoff Year of the Snake 2025',
    brand: 'Davidoff',
    releaseDate: new Date('2025-12-15'),
    region: 'UK & Europe',
    availability: 'Pre-order' as const,
    description: 'Limited edition release celebrating the Year of the Snake with unique blend and packaging.',
    notified: false,
  };

  return <ReleaseCard release={release} onToggleNotification={(id) => console.log('Toggle', id)} />;
}
