const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'cash_flow_plans',
  fields: ['client_id','plan_name','monthly_income','monthly_expenses','withdrawal_rate','liquidity_months','strategy','next_review_date','status','notes'],
});
