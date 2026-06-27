import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'tax_year', label: 'Tax Year', type: 'number' },
  { key: 'package_type', label: 'Package Type', options: ['annual_tax_packet','1099_package','k1_package','realized_gain_loss','cpa_package'] },
  { key: 'forms_included', label: 'Forms Included', type: 'textarea' },
  { key: 'delivery_method', label: 'Delivery Method', options: ['client_portal','secure_email','cpa_delivery'] },
  { key: 'prepared_by', label: 'Prepared By' },
  { key: 'review_status', label: 'Review Status', options: ['not_started','prepared','in_review','approved','correction_needed'] },
  { key: 'delivered_at', label: 'Delivered At', type: 'datetime-local' },
  { key: 'status', label: 'Status', options: ['draft','ready','delivered','corrected'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function TaxPackages() {
  return <FeatureManagementPage title="Tax Packages" recordLabel="Tax Package" subtitle="Annual tax document package tracking for 1099, K-1, gain/loss, and CPA delivery workflows." apiClient={api.taxPackages} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[4], fields[6], fields[8]]} />;
}
