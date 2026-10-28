import {spawnSync} from 'node:child_process';
for(const file of ['test-rollover.mjs','test-categories.mjs','test-today.mjs','test-overlap.mjs','test-quick.mjs','test-trash.mjs','test-search.mjs','test-split.mjs','test-monthly.mjs','test-task-files.mjs','test-slots.mjs','test-productivity.mjs','test-move.mjs','test-mobile.mjs','test-weekly.mjs','test-month.mjs','test-deadline.mjs','test-subtasks.mjs','test-phone.mjs','test-completion.mjs','test-widget.mjs','test-inbox.mjs','test-model.mjs','test-habits.mjs','test-reminders.mjs','test-github.mjs','test-journal-sync.mjs','test-pwa.mjs']){const run=spawnSync(process.execPath,['scripts/'+file],{stdio:'inherit'});if(run.status!==0)process.exit(run.status||1)}








