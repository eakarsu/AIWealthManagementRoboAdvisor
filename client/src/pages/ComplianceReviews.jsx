import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'review_type', label: 'Review Type', options: ['Reg BI review','ADV delivery','Suitability review','KYC refresh','Marketing review'] },
  { key: 'regulation', label: 'Regulation', options: ['Reg BI','Form ADV','FINRA 2111','KYC/AML','SEC Marketing Rule'] },
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'completed_date', label: 'Completed Date', type: 'date' },
  { key: 'risk_level', label: 'Risk Level', options: ['low','medium','high','critical'] },
  { key: 'status', label: 'Status', options: ['pending','in_review','approved','remediation_required'] },
  { key: 'findings', label: 'Findings', type: 'textarea' },
  { key: 'remediation_plan', label: 'Remediation Plan', type: 'textarea' },
];

export default function ComplianceReviews() {
  return <FeatureManagementPage title="Compliance Reviews" recordLabel="Compliance Review" subtitle="Reg BI, ADV, suitability, KYC, and reviewer queue management." apiClient={api.complianceReviews} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[4], fields[6], fields[7]]} />;
}
