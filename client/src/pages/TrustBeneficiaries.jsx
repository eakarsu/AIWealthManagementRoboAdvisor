import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'trust_name', label: 'Trust Name' },
  { key: 'beneficiary_name', label: 'Beneficiary' },
  { key: 'relationship', label: 'Relationship', options: ['child','spouse','charity','grandchild','sibling'] },
  { key: 'beneficiary_type', label: 'Beneficiary Type', options: ['primary','contingent','charitable','trustee'] },
  { key: 'distribution_terms', label: 'Distribution Terms', type: 'textarea' },
  { key: 'current_value', label: 'Current Value', type: 'number', money: true },
  { key: 'next_review_date', label: 'Next Review', type: 'date' },
  { key: 'status', label: 'Status', options: ['active','needs_review','draft','inactive'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function TrustBeneficiaries() {
  return <FeatureManagementPage title="Trust Beneficiaries" recordLabel="Trust Beneficiary" subtitle="Track trust structures, beneficiaries, distribution terms, and review dates." apiClient={api.trustBeneficiaries} fields={fields} tableColumns={[fields[1], fields[2], fields[3], fields[4], fields[6], fields[8]]} />;
}
