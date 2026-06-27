const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'trust_beneficiaries',
  fields: ['client_id','trust_name','beneficiary_name','relationship','beneficiary_type','distribution_terms','current_value','next_review_date','status','notes'],
});
