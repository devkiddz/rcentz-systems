import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const schema = readFileSync('prisma/schema.prisma','utf8');
const sql = readFileSync('prisma/migrations/20261017000000_milestone_accountability_expand/migration.sql','utf8');
for (const name of ['ProjectMilestoneCriterion','ProjectMilestoneReview','ProjectProgressOverride']) {
  test(`${name} exists in schema and SQL`, () => {
    assert.match(schema,new RegExp(`model ${name} \\{`));
    assert.ok(sql.includes(`CREATE TABLE "${name}"`));
  });
}
test('migration never mutates existing project or milestone rows', () => {
  assert.doesNotMatch(sql,/^\s*(?:DELETE|DROP|TRUNCATE|INSERT|UPDATE)\s/mi);
  assert.doesNotMatch(sql,/ALTER TABLE "(?:Project|ProjectMilestone)"\b/i);
});
test('criteria default unverified and no backfill', () => {
  assert.match(schema,/verified\s+Boolean\s+@default\(false\)/);
  assert.match(sql,/"verified" BOOLEAN NOT NULL DEFAULT false/);
});
test('reviews retain criteria revision and snapshot', () => {
  assert.match(schema,/criteriaRevision Int/);
  assert.match(schema,/criteriaSnapshot Json/);
});
