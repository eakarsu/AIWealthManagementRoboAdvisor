const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'tax_packages',
  fields: ['client_id','tax_year','package_type','forms_included','delivery_method','prepared_by','review_status','delivered_at','status','notes'],
});
