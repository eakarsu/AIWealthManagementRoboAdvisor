const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'insurance_plans',
  fields: ['client_id','policy_type','carrier','coverage_amount','premium_amount','beneficiary','renewal_date','gap_assessment','status','notes'],
});
