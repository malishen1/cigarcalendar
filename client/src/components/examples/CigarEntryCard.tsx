import CigarEntryCard from '../CigarEntryCard';

export default function CigarEntryCardExample() {
  const entry = {
    id: '1',
    cigarName: 'Montecristo No. 2',
    brand: 'Habanos S.A.',
    rating: 5,
    date: new Date('2025-11-03T19:30:00'),
    notes: 'Exceptional smoke with rich, earthy flavors and hints of coffee and dark chocolate. Perfect draw and even burn throughout.',
    duration: 75,
    strength: 'Medium' as const,
    hasCalendarEvent: true,
  };

  return (
    <CigarEntryCard 
      entry={entry}
      onEdit={(id) => console.log('Edit', id)}
      onDelete={(id) => console.log('Delete', id)}
    />
  );
}
