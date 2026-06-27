const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'households',
  fields: ['household_name','primary_client_id','relationship_manager','total_net_worth','annual_income','risk_profile','planning_stage','status','notes'],
});
