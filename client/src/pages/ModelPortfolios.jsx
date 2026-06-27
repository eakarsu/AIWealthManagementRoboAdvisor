import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'model_name', label: 'Model Name' },
  { key: 'risk_level', label: 'Risk Level', options: ['low','low-moderate','moderate','moderate-high','high'] },
  { key: 'objective', label: 'Objective', type: 'textarea' },
  { key: 'target_allocation', label: 'Target Allocation', type: 'textarea' },
  { key: 'minimum_account_size', label: 'Minimum Account Size', type: 'number', money: true },
  { key: 'rebalance_frequency', label: 'Rebalance Frequency', options: ['monthly','quarterly','semiannual','annual'] },
  { key: 'benchmark', label: 'Benchmark' },
  { key: 'status', label: 'Status', options: ['active','draft','archived'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function ModelPortfolios() {
  return <FeatureManagementPage title="Model Portfolios" recordLabel="Model Portfolio" subtitle="Model portfolio and proposal library for advisor recommendations." apiClient={api.modelPortfolios} fields={fields} tableColumns={[fields[0], fields[1], fields[4], fields[5], fields[6], fields[7]]} />;
}
