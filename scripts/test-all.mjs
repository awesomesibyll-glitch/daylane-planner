import {spawnSync} from 'node:child_process';
for(const file of ['test-widget.mjs','test-inbox.mjs','test-model.mjs','test-habits.mjs','test-reminders.mjs','test-github.mjs','test-journal-sync.mjs','test-pwa.mjs']){const run=spawnSync(process.execPath,['scripts/'+file],{stdio:'inherit'});if(run.status!==0)process.exit(run.status||1)}
