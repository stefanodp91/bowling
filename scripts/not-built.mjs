// Placeholder for a root command whose wiki page is not built yet (wiki/workspace/monorepo.md, rule 8).
const page = process.argv[2] ?? '<unknown page>';
console.error(`not built yet: see wiki/${page}`);
process.exit(1);
