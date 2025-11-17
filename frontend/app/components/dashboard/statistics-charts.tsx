import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

const normalizeChartData = (data: any[]): any[] => {
  const total = data.reduce(
    (sum: number, item: any) => sum + (item.value || 0),
    0
  );

  if (total === 0) return data.map((item) => ({ ...item, displayValue: 0 }));

  // If only one category has data, ensure others have minimal visibility
  const nonZeroItems = data.filter((item: any) => (item.value || 0) > 0);

  if (nonZeroItems.length === 1) {
    return data.map((item: any) => ({
      ...item,
      // Keep actual values but ensure visualization works
      displayValue: (item.value || 0) > 0 ? Math.max(item.value, 1) : 0.001,
    }));
  }

  // For multiple non-zero items, use actual values
  return data.map((item: any) => ({
    ...item,
    displayValue: item.value || 0,
  }));
};

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  // Normalize the data for proper pie chart display
  const normalizedProjectData = normalizeChartData(projectStatusData);
  const normalizedPriorityData = normalizeChartData(taskPriorityData);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                completed: { color: "#10b981" }, // green
                inProgress: { color: "#f59e0b" }, // blue
                todo: { color: "#3b82f6" }, // gray
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey={"name"}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
                <ChartTooltip />

                <Line
                  type="monotone"
                  dataKey={"completed"}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Status Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Project Status
            </CardTitle>
            <CardDescription>Project status breakdown</CardDescription>
          </div>
          <ChartPie className="size-5 text-muted-foreground" />
        </CardHeader>

        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                Completed: { color: "#10b981" },
                "In Progress": { color: "#3b82f6" },
                Planning: { color: "#f59e0b" },
              }}
            >
              <PieChart>
                <Pie
                  data={normalizedProjectData}
                  cx="50%"
                  cy="50%"
                  dataKey="displayValue"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={
                    normalizedProjectData.filter(
                      (item: any) => (item.value || 0) > 0
                    ).length > 1
                      ? 2
                      : 0
                  }
                  label={({ name, value, percent }: any) => {
                    const actualValue =
                      projectStatusData.find((p: any) => p.name === name)
                        ?.value || 0;
                    if (actualValue > 0) {
                      const total = projectStatusData.reduce(
                        (sum: number, p: any) => sum + (p.value || 0),
                        0
                      );
                      const actualPercent =
                        total > 0 ? (actualValue / total) * 100 : 0;
                      return `${name} (${actualPercent.toFixed(0)}%)`;
                    }
                    return null;
                  }}
                  labelLine={false}
                >
                  {normalizedProjectData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={(entry.value || 0) > 0 ? 1 : 0.3}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  formatter={(value: any, name: any) => {
                    const actualItem = projectStatusData.find(
                      (item: any) => item.name === name
                    );
                    return [actualItem?.value || 0, name];
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Priority Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Task Priority
            </CardTitle>
            <CardDescription>Task priority breakdown</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                High: { color: "#ef4444" },
                Medium: { color: "#f59e0b" },
                Low: { color: "#6b7280" },
              }}
            >
              <PieChart>
                <Pie
                  data={normalizedPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={
                    normalizedPriorityData.filter(
                      (item: any) => (item.value || 0) > 0
                    ).length > 1
                      ? 2
                      : 0
                  }
                  dataKey="displayValue"
                  nameKey="name"
                  label={({ name, value, percent }: any) => {
                    const actualValue =
                      taskPriorityData.find((p: any) => p.name === name)
                        ?.value || 0;
                    if (actualValue > 0) {
                      const total = taskPriorityData.reduce(
                        (sum: number, p: any) => sum + (p.value || 0),
                        0
                      );
                      const actualPercent =
                        total > 0 ? (actualValue / total) * 100 : 0;
                      return `${name} ${actualPercent.toFixed(0)}%`;
                    }
                    return null;
                  }}
                  labelLine={false}
                >
                  {normalizedPriorityData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={(entry.value || 0) > 0 ? 1 : 0.3}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  formatter={(value: any, name: any) => {
                    const actualItem = taskPriorityData.find(
                      (item: any) => item.name === name
                    );
                    return [actualItem?.value || 0, name];
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Productivity Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">
              Workspace Productivity
            </CardTitle>
            <CardDescription>Task completion by project</CardDescription>
          </div>
          <ChartBarBig className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px]"
              config={{
                completed: { color: "#3b82f6" },
                total: { color: "red" },
              }}
            >
              <BarChart
                data={workspaceProductivityData}
                barGap={0}
                barSize={20}
              >
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="#000"
                  radius={[4, 4, 0, 0]}
                  name="Total Tasks"
                />
                <Bar
                  dataKey="completed"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Completed Tasks"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
