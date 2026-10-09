export type Assessment = { matched: string[]; concerns: string[]; questions: string[]; eligibility: string; verdict: string };
export const defaultSkills = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Prisma', 'PostgreSQL'];
export const statuses = ['NEW', 'SHORTLISTED', 'APPLIED', 'REPLIED', 'CLOSED'] as const;
