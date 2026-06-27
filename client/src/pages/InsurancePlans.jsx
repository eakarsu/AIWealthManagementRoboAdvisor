import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'policy_type', label: 'Policy Type', options: ['term_life','whole_life','disability','umbrella','long_term_care'] },
  { key: 'carrier', label: 'Carrier' },
  { key: 'coverage_amount', label: 'Coverage Amount', type: 'number', money: true },
  { key: 'premium_amount', label: 'Premium Amount', type: 'number', money: true },
  { key: 'beneficiary', label: 'Beneficiary' },
  { key: 'renewal_date', label: 'Renewal Date', type: 'date' },
  { key: 'gap_assessment', label: 'Gap Assessment', type: 'textarea' },
  { key: 'status', label: 'Status', options: ['active','review_due','lapsed','proposed'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function InsurancePlans() {
  return <FeatureManagementPage title="Insurance Plans" recordLabel="Insurance Plan" subtitle="Life, disability, umbrella, and long-term-care coverage review workflows." apiClient={api.insurancePlans} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[3], fields[6], fields[8]]} />;
}
