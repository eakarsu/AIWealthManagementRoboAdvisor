import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'portfolio_id', label: 'Portfolio', optionsFrom: 'portfolios' },
  { key: 'policy_name', label: 'Policy Name' },
  { key: 'objective', label: 'Objective', type: 'textarea' },
  { key: 'target_allocation', label: 'Target Allocation', type: 'textarea' },
  { key: 'constraints', label: 'Constraints', type: 'textarea' },
  { key: 'review_frequency', label: 'Review Frequency', options: ['monthly','quarterly','semiannual','annual'] },
  { key: 'next_review_date', label: 'Next Review', type: 'date' },
  { key: 'status', label: 'Status', options: ['draft','approved','review_due','archived'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function InvestmentPolicies() {
  return <FeatureManagementPage title="Investment Policies" recordLabel="Investment Policy" subtitle="Manage IPS documents, allocation bands, client constraints, and review cadence." apiClient={api.investmentPolicies} fields={fields} tableColumns={[fields[2], fields[0], fields[1], fields[6], fields[7], fields[8]]} />;
}
