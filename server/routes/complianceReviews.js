const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'compliance_reviews',
  fields: ['client_id','review_type','regulation','reviewer','due_date','completed_date','risk_level','status','findings','remediation_plan'],
});
