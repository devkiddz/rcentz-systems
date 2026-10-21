/** Pure calculations only. No database writes or authorization decisions. */
export type CriterionResult = {
  required: boolean;
  verified: boolean;
};

export type MilestoneResult = {
  approved: boolean;
  completed: boolean;
  cancelled: boolean;
};

export type ProgressMeasurement = {
  measured: boolean;
  percent: number | null;
  numerator: number;
  denominator: number;
};

function percentage(numerator: number, denominator: number): ProgressMeasurement {
  if (denominator === 0) {
    return { measured: false, percent: null, numerator: 0, denominator: 0 };
  }
  return {
    measured: true,
    percent: Math.round((numerator / denominator) * 100),
    numerator,
    denominator
  };
}

/** Optional criteria are informational and do not alter the denominator. */
export function measureMilestoneCriteria(criteria: readonly CriterionResult[]): ProgressMeasurement {
  const required = criteria.filter(item => item.required);
  return percentage(required.filter(item => item.verified).length, required.length);
}

/** Cancelled milestones are excluded; only explicitly approved completions count. */
export function measureProjectMilestones(milestones: readonly MilestoneResult[]): ProgressMeasurement {
  const eligible = milestones.filter(item => !item.cancelled);
  return percentage(eligible.filter(item => item.completed && item.approved).length, eligible.length);
}

export function canApproveMilestone(criteria: readonly CriterionResult[]): boolean {
  const measurement = measureMilestoneCriteria(criteria);
  return measurement.measured && measurement.numerator === measurement.denominator;
}
