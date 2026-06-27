import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'household_name', label: 'Household Name' },
  { key: 'primary_client_id', label: 'Primary Client', optionsFrom: 'clients' },
  { key: 'relationship_manager', label: 'Relationship Manager' },
  { key: 'total_net_worth', label: 'Total Net Worth', type: 'number', money: true },
  { key: 'annual_income', label: 'Annual Income', type: 'number', money: true },
  { key: 'risk_profile', label: 'Risk Profile', options: ['conservative','moderate','aggressive'] },
  { key: 'planning_stage', label: 'Planning Stage', options: ['onboarding','planning','implementation','annual_review','next_gen_transfer'] },
  { key: 'status', label: 'Status', options: ['active','review','inactive'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function Households() {
  return <FeatureManagementPage title="Households" recordLabel="Household" subtitle="Manage family groups, next-generation relationships, and household-level planning." apiClient={api.households} fields={fields} tableColumns={fields.slice(0, 6)} />;
}
