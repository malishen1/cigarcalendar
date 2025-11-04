import QuickLogForm from '../QuickLogForm';

export default function QuickLogFormExample() {
  return <QuickLogForm onSubmit={(data) => console.log('Submitted:', data)} />;
}
