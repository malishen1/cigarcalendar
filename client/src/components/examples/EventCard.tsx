import EventCard from '../EventCard';

export default function EventCardExample() {
  const event = {
    id: '1',
    name: 'London Cigar Festival 2025',
    date: new Date('2025-12-01T14:00:00'),
    location: 'London, UK',
    type: 'Festival' as const,
    description: 'Annual gathering of cigar enthusiasts featuring tastings, seminars, and exclusive releases.',
    attendees: 250,
    link: '#',
  };

  return <EventCard event={event} />;
}
