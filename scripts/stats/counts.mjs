// Pure counts behind npm run stats (wiki/method/stats.md, rule 3). No I/O here.
import { sectionText } from '../wiki/parse.mjs';

/** A stretch of agent commits breaks on a gap over this many minutes (wiki/method/stats.md). */
export const STREAK_GAP_MIN = 30;
const MS_PER_MIN = 60_000;
const STATUSES = ['planned', 'built', 'approved'];
const TRAILER = /^Co-Authored-By:\s*(.+?)\s*<[^>]*>\s*$/gim;
const LIST_ITEM = /^- /;

export function statusCounts(specPages) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const page of specPages) counts[page.frontMatter.status] = (counts[page.frontMatter.status] ?? 0) + 1;
  return { ...counts, builtNotApproved: counts.built };
}

const listItems = (text) => (text ?? '').split('\n').filter((line) => LIST_ITEM.test(line)).length;

export function reviewCounts(reviewBody) {
  return { toJudge: listItems(sectionText(reviewBody, 'To judge')), approved: listItems(sectionText(reviewBody, 'Approved')) };
}

export function roundCounts(specPages) {
  const perPage = specPages.map((p) => ({ path: p.path, rounds: listItems(sectionText(p.body, 'Rounds')) }));
  return {
    total: perPage.reduce((sum, p) => sum + p.rounds, 0),
    pagesWithMoreThanOne: perPage.filter((p) => p.rounds > 1).map((p) => p.path),
  };
}

/** The agent and model a commit is signed by, or undefined for a human commit. */
export function agentOf(message) {
  const names = [...message.matchAll(TRAILER)].map((m) => m[1]);
  return names[0];
}

export function commitsPerAgent(commits) {
  const perAgent = {};
  let human = 0;
  for (const commit of commits) {
    const agent = agentOf(commit.message);
    if (agent === undefined) human += 1;
    else perAgent[agent] = (perAgent[agent] ?? 0) + 1;
  }
  return { total: commits.length, human, perAgent };
}

/**
 * The longest run of consecutive agent commits (in time order) with no gap over STREAK_GAP_MIN.
 * A human commit ends a run. Returns the number of commits and the duration in minutes.
 */
export function longestAgentStreak(commits, gapMin = STREAK_GAP_MIN) {
  const sorted = [...commits].sort((a, b) => a.date - b.date);
  let best = { commits: 0, minutes: 0 };
  let start;
  let previous;
  let count = 0;
  for (const commit of sorted) {
    const isAgent = agentOf(commit.message) !== undefined;
    const continues = isAgent && previous !== undefined && (commit.date - previous.date) / MS_PER_MIN <= gapMin;
    if (!isAgent) {
      count = 0;
      previous = undefined;
      continue;
    }
    if (continues) count += 1;
    else {
      start = commit;
      count = 1;
    }
    previous = commit;
    const minutes = (commit.date - start.date) / MS_PER_MIN;
    if (count > best.commits || (count === best.commits && minutes > best.minutes)) best = { commits: count, minutes };
  }
  return best;
}
