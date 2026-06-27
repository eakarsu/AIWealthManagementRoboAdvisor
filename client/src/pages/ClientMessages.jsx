import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'sender', label: 'Sender' },
  { key: 'recipient', label: 'Recipient' },
  { key: 'subject', label: 'Subject' },
  { key: 'message_body', label: 'Message', type: 'textarea' },
  { key: 'channel', label: 'Channel', options: ['portal','secure_email','sms_notice'] },
  { key: 'priority', label: 'Priority', options: ['low','normal','high','urgent'] },
  { key: 'read_status', label: 'Read Status', options: ['unread','read','responded'] },
  { key: 'sent_at', label: 'Sent At', type: 'datetime-local' },
  { key: 'status', label: 'Status', options: ['sent','archived','draft'] },
];

export default function ClientMessages() {
  return <FeatureManagementPage title="Client Messages" recordLabel="Client Message" subtitle="Client portal and secure messaging workflow for advisor-client communication." apiClient={api.clientMessages} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[3], fields[6], fields[7]]} statusKey="read_status" />;
}
