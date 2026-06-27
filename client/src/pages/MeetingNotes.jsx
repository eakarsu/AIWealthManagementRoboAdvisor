import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'meeting_date', label: 'Meeting Date', type: 'date' },
  { key: 'meeting_type', label: 'Meeting Type', options: ['annual_review','portfolio_review','tax_planning','estate_review','prospect_call'] },
  { key: 'advisor', label: 'Advisor' },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'follow_up_items', label: 'Follow-Up Items', type: 'textarea' },
  { key: 'next_meeting_date', label: 'Next Meeting', type: 'date' },
  { key: 'sentiment', label: 'Sentiment', options: ['positive','neutral','concerned','highly_engaged'] },
  { key: 'status', label: 'Status', options: ['open','completed','waiting_on_client','advisor_follow_up'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function MeetingNotes() {
  return <FeatureManagementPage title="Meeting Notes" recordLabel="Meeting Note" subtitle="Advisor CRM notes, follow-ups, sentiment, and next meeting workflow." apiClient={api.meetingNotes} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[3], fields[7], fields[8]]} />;
}
