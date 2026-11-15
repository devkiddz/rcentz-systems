import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { ProjectDevelopmentObservability } from './ProjectDevelopmentObservability';
import { ProjectLogsHistory, type ProjectLogEvent } from './ProjectLogsHistory';

type Props = { project: AdminProject; activity?: ProjectActivitySummary; canReconcile: boolean };

function githubCommitUrl(repository: string, sha: string) {
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) && /^[a-fA-F0-9]{7,64}$/.test(sha)
    ? `https://github.com/${repository}/commit/${sha}`
    : undefined;
}

function collectEvents(project: AdminProject, activity?: ProjectActivitySummary): ProjectLogEvent[] {
  const events: ProjectLogEvent[] = [
    {
      id: `project:${project.id}:registration`, at: project.createdAt.toISOString(), category: 'Project',
      kind: 'Registered', title: 'Project registered', detail: project.name, status: 'RECORDED'
    }
  ];
  if (activity?.latestCommit) {
    const commit = activity.latestCommit;
    events.push({
      id: `github:commit:${commit.repository}:${commit.sha}`, at: commit.committedAt,
      category: 'GitHub', kind: 'Commit', title: commit.message.split(/\r?\n/, 1)[0] || 'GitHub commit',
      detail: commit.message, status: 'RECORDED', repository: commit.repository,
      branch: commit.branch, sha: commit.sha, url: githubCommitUrl(commit.repository, commit.sha)
    });
  }
  for (const [index, marker] of (activity?.milestoneEvents ?? []).entries()) {
    events.push({
      id: `github:marker:${marker.repository}:${marker.sha}:${index}`, at: marker.committedAt, category: 'GitHub', kind: 'Marker',
      title: `${marker.milestoneKey} · ${marker.kind}`, detail: `${marker.message}\nLegacy GitHub marker. Not evidence of governed milestone approval.`,
      status: 'UNVERIFIED', repository: marker.repository, branch: marker.branch, sha: marker.sha,
      url: githubCommitUrl(marker.repository, marker.sha)
    });
  }
  for (const milestone of project.milestones) {
    events.push({
      id: `milestone:${milestone.id}:registration`, at: milestone.createdAt.toISOString(), category: 'Milestone',
      kind: 'Registered', title: `Milestone created: ${milestone.title}`,
      detail: milestone.description ?? 'Manual project milestone was registered.', status: 'RECORDED'
    });
    for (const review of milestone.reviews) {
      events.push({
        id: `review:${review.id}`, at: review.createdAt.toISOString(), category: 'Milestone', kind: 'Review',
        title: `${review.decision === 'APPROVED' ? 'Approved' : review.decision === 'REJECTED' ? 'Rejected' : 'Reviewed'}: ${milestone.title}`,
        detail: `Criteria revision ${review.criteriaRevision}. ${review.reason ?? 'No review note recorded.'}`,
        status: review.decision
      });
    }
    if (milestone.status === 'COMPLETED' && milestone.completedAt) {
      events.push({
        id: `milestone:${milestone.id}:completed`, at: milestone.completedAt.toISOString(), category: 'Milestone',
        kind: 'Completed', title: `Milestone completed: ${milestone.title}`,
        detail: milestone.completionNotes || 'Completion recorded by project governance.', status: 'COMPLETED'
      });
    }
  }
  for (const item of project.activities) {
    events.push({
      id: `brief:${item.id}`, at: item.createdAt.toISOString(), category: 'Project',
      kind: 'Brief', title: 'Customer brief recorded', detail: item.description || 'Customer brief reference recorded.', status: 'RECORDED'
    });
  }
  return events
    .filter(item => Number.isFinite(new Date(item.at).getTime()))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime() || a.id.localeCompare(b.id))
    .slice(0, 200);
}

export function AdminProjectLogsHistory({ project, activity, canReconcile }: Props) {
  return (
    <div className="space-y-4">
      <ProjectLogsHistory
        projectId={project.id}
        events={collectEvents(project, activity)}
        repositoryUrl={project.portfolio?.repositoryUrl ?? null}
        sourceState={activity?.state ?? 'UNAVAILABLE'}
      />
      <ProjectDevelopmentObservability
        activity={activity}
        canReconcile={canReconcile}
        projectId={project.id}
        milestones={project.milestones
          .filter(milestone => Boolean(milestone.delivery))
          .map(milestone => ({ id: milestone.id, title: milestone.title }))}
      />
    </div>
  );
}
