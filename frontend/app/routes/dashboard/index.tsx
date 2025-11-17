import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId || "", {
    enabled: !!workspaceId,
  }) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  if (!workspaceId) {
    return (
      <div className="space-y-8 2xl:space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <p className="text-muted-foreground">
            Please select a workspace to view dashboard
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8 2xl:space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <p className="text-muted-foreground">
            No data available for this workspace
          </p>
        </div>
      </div>
    );
  }

  const stats = data.stats || {
    totalProjects: 0,
    totalTasks: 0,
    totalProjectInProgress: 0,
    totalTaskCompleted: 0,
    totalTaskToDo: 0,
    totalTaskInProgress: 0,
  };

  const taskTrendsData = data.taskTrendsData || [];
  const projectStatusData = data.projectStatusData || [];
  const taskPriorityData = data.taskPriorityData || [];
  const workspaceProductivityData = data.workspaceProductivityData || [];
  const upcomingTasks = data.upcomingTasks || [];
  const recentProjects = data.recentProjects || [];

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <StatsCard data={stats} />

      <StatisticsCharts
        stats={stats}
        taskTrendsData={taskTrendsData}
        projectStatusData={projectStatusData}
        taskPriorityData={taskPriorityData}
        workspaceProductivityData={workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={recentProjects} />
        <UpcomingTasks data={upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
