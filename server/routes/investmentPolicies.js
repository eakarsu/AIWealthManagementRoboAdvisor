const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'investment_policies',
  fields: ['client_id','portfolio_id','policy_name','objective','target_allocation','constraints','review_frequency','next_review_date','status','notes'],
});
