import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'plan_name', label: 'Plan Name' },
  { key: 'monthly_income', label: 'Monthly Income', type: 'number', money: true },
  { key: 'monthly_expenses', label: 'Monthly Expenses', type: 'number', money: true },
  { key: 'withdrawal_rate', label: 'Withdrawal Rate %', type: 'number' },
  { key: 'liquidity_months', label: 'Liquidity Months', type: 'number' },
  { key: 'strategy', label: 'Strategy', type: 'textarea' },
  { key: 'next_review_date', label: 'Next Review', type: 'date' },
  { key: 'status', label: 'Status', options: ['active','review_due','draft','paused'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function CashFlowPlans() {
  return <FeatureManagementPage title="Cash Flow Plans" recordLabel="Cash Flow Plan" subtitle="Income, spending, liquidity runway, and withdrawal strategy planning." apiClient={api.cashFlowPlans} fields={fields} tableColumns={[fields[0], fields[1], fields[2], fields[3], fields[4], fields[8]]} />;
}
