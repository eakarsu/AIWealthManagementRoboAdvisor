const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'meeting_notes',
  fields: ['client_id','meeting_date','meeting_type','advisor','summary','follow_up_items','next_meeting_date','sentiment','status','notes'],
});
