// npm run stats [-- --md]: numbers about how the demo was built, from git and the wiki only
// (wiki/method/stats.md).
import { REPO_ROOT } from '../lib/gate.mjs';
import { commitsPerAgent, longestAgentStreak, reviewCounts, roundCounts, statusCounts, STREAK_GAP_MIN } from './counts.mjs';
import { readCommits, readGates, readShots, readWiki } from './read-repo.mjs';

export function collectStats(root) {
  const { specs, reviewBody } = readWiki(root);
  const commits = readCommits(root);
  const statuses = statusCounts(specs);
  const review = reviewCounts(reviewBody);
  const rounds = roundCounts(specs);
  const perAgent = commitsPerAgent(commits);
  const streak = longestAgentStreak(commits);
  const gates = readGates(root);
  const shots = readShots(root);
  const rows = [
    ['Spec pages planned / built / approved', `${statuses.planned} / ${statuses.built} / ${statuses.approved}`],
    ['Built by the agent, not yet approved by a human', `${statuses.builtNotApproved}`],
    ['Review: to judge / approved', `${review.toJudge} / ${review.approved}`],
    ['Self-approval rounds recorded', `${rounds.total}`],
    ['Pages that needed more than one round', rounds.pagesWithMoreThanOne.length === 0 ? '0' : `${rounds.pagesWithMoreThanOne.length} (${rounds.pagesWithMoreThanOne.join(', ')})`],
    ['Commits in total / by a human', `${perAgent.total} / ${perAgent.human}`],
    ...Object.entries(perAgent.perAgent).map(([agent, n]) => [`Commits by ${agent}`, `${n}`]),
    [`Longest agent streak (no gap over ${STREAK_GAP_MIN} min)`, `${streak.commits} commits in ${Math.round(streak.minutes)} min`],
    ['Gates', `${gates.length}`],
    ...gates.map(({ gate, added }) => [`  ${gate}`, `added in ${added}`]),
    ['Shots taken', shots === undefined ? 'local, not in git (no shots/shots.log here)' : `${shots} (local, not in git)`],
  ];
  return rows;
}

export function renderText(rows) {
  const width = Math.max(...rows.map(([label]) => label.length));
  return rows.map(([label, value]) => `${label.padEnd(width)}  ${value}`).join('\n');
}

export function renderMarkdown(rows) {
  const escape = (text) => text.replaceAll('|', '\\|');
  return ['| Measure | Value |', '|---|---|', ...rows.map(([l, v]) => `| ${escape(l.trim())} | ${escape(v)} |`)].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = collectStats(REPO_ROOT);
  console.log(process.argv.includes('--md') ? renderMarkdown(rows) : renderText(rows));
}
