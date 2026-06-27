const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'model_portfolios',
  fields: ['model_name','risk_level','objective','target_allocation','minimum_account_size','rebalance_frequency','benchmark','status','notes'],
});
