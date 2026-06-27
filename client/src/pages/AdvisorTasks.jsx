import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'task_type', label: 'Task Type', options: ['review','compliance','client_follow_up','proposal','operations'] },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority', options: ['low','medium','high','urgent'] },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'completed_at', label: 'Completed At', type: 'datetime-local' },
  { key: 'status', label: 'Status', options: ['open','in_progress','completed','blocked'] },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function AdvisorTasks() {
  return <FeatureManagementPage title="Advisor Tasks" recordLabel="Advisor Task" subtitle="Team workflow for client service, proposals, operations, and compliance follow-up." apiClient={api.advisorTasks} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[3], fields[4], fields[7]]} />;
}
