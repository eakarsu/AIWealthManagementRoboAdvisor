const buildCrud = require('./_genericCrud');

module.exports = buildCrud({
  table: 'client_messages',
  fields: ['client_id','sender','recipient','subject','message_body','channel','priority','read_status','sent_at','status'],
});
