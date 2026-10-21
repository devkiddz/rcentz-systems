import test from 'node:test';
import assert from 'node:assert/strict';
import {
  measureMilestoneCriteria,
  measureProjectMilestones,
  canApproveMilestone
} from '../features/admin/lib/milestone-progress-policy.ts';

test('empty criteria are unmeasured and cannot be approved', () => {
  assert.deepEqual(measureMilestoneCriteria([]), { measured: false, percent: null, numerator: 0, denominator: 0 });
  assert.equal(canApproveMilestone([]), false);
});
test('three of four verified required criteria is 75 percent, not approvable', () => {
  const criteria = [true, true, true, false].map(verified => ({ required: true, verified }));
  assert.equal(measureMilestoneCriteria(criteria).percent, 75);
  assert.equal(canApproveMilestone(criteria), false);
});
test('optional criteria do not inflate required progress', () => {
  const criteria = [{ required: true, verified: true }, { required: false, verified: false }];
  assert.equal(measureMilestoneCriteria(criteria).percent, 100);
  assert.equal(canApproveMilestone(criteria), true);
});
test('empty project is not measured', () => {
  assert.equal(measureProjectMilestones([]).percent, null);
});
test('unapproved completion never increases project progress', () => {
  const milestones = [
    { completed: true, approved: true, cancelled: false },
    { completed: true, approved: false, cancelled: false }
  ];
  assert.equal(measureProjectMilestones(milestones).percent, 50);
});
test('reopening an approved milestone decreases project progress', () => {
  const initial = [{ completed: true, approved: true, cancelled: false }];
  const reopened = [{ completed: false, approved: false, cancelled: false }];
  assert.equal(measureProjectMilestones(initial).percent, 100);
  assert.equal(measureProjectMilestones(reopened).percent, 0);
});
test('cancelled milestones do not enter the denominator', () => {
  const milestones = [
    { completed: true, approved: true, cancelled: false },
    { completed: false, approved: false, cancelled: true }
  ];
  assert.equal(measureProjectMilestones(milestones).percent, 100);
});
