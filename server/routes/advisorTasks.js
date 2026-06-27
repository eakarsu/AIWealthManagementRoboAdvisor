const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'advisor_tasks',
  fields: ['client_id','assigned_to','task_type','title','priority','due_date','completed_at','status','description','notes'],
});
