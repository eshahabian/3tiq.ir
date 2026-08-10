#!/usr/bin/env node
/** Prints next peak slug from ascent-guide-schedule.json (for humans / automation logs). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const schedule = JSON.parse(
  fs.readFileSync(path.join(root, 'data/ascent-guide-schedule.json'), 'utf8')
);
const next = schedule.upcoming?.[0];
if (next) {
  console.log(JSON.stringify(next, null, 2));
} else {
  console.log('No upcoming peaks in schedule; pick from famousPeaks without a dedicated series guide.');
  process.exit(1);
}
