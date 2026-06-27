import FeatureManagementPage from '../components/FeatureManagementPage';
import { api } from '../services/api';

const fields = [
  { key: 'client_id', label: 'Client', optionsFrom: 'clients' },
  { key: 'custodian_name', label: 'Custodian' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'account_type', label: 'Account Type', options: ['taxable','ira','roth_ira','trust','joint','401k'] },
  { key: 'sync_status', label: 'Sync Status', options: ['connected','needs_reauth','syncing','error'] },
  { key: 'last_sync_at', label: 'Last Sync', type: 'datetime-local' },
  { key: 'market_value', label: 'Market Value', type: 'number', money: true },
  { key: 'cash_value', label: 'Cash Value', type: 'number', money: true },
  { key: 'external_owner', label: 'External Owner' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function CustodianAccounts() {
  return <FeatureManagementPage title="Custodian Accounts" recordLabel="Custodian Account" subtitle="Aggregate external broker/custodian accounts, balances, sync status, and account ownership." apiClient={api.custodianAccounts} fields={fields} tableColumns={[fields[1], fields[2], fields[3], fields[4], fields[6], fields[7]]} statusKey="sync_status" />;
}
