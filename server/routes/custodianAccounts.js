const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'custodian_accounts',
  fields: ['client_id','custodian_name','account_number','account_type','sync_status','last_sync_at','market_value','cash_value','external_owner','notes'],
});
