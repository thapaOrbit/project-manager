import { useEffect, useState } from "react";
import { Loader } from "@/components/loader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  User,
  Folder,
  ArrowUpRight,
  ArchiveRestore,
  Archive,
} from "lucide-react";
import { fetchData } from "@/lib/fetch-util";
import { useArchiveTaskMutation } from "@/hooks/use-task";
import type { Task, Workspace } from "@/types";
import { Link, useSearchParams } from "react-router-dom";

const ArchivedTasks = () => {
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mutate: archiveTask, isPending: isArchiving } =
    useArchiveTaskMutation();

  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  useEffect(() => {
    const fetchArchivedTasks = async () => {
      try {
        const data = await fetchData<Task[]>("/tasks/archived");
        setArchivedTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedTasks();
  }, []);

  const filteredTasks = archivedTasks.filter((task: Task) => {
    if (!workspaceId) return true;

    if (task.project?.workspace) {
      if (typeof task.project.workspace === "string") {
        return task.project.workspace === workspaceId;
      } else if (typeof task.project.workspace === "object") {
        return (task.project.workspace as Workspace)._id === workspaceId;
      }
    }

    return false;
  });

  const handleUnarchive = (taskId: string) => {
    archiveTask(
      { taskId },
      {
        onSuccess: () => {
          setArchivedTasks((prev) =>
            prev.filter((task) => task._id !== taskId)
          );
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "To Do": "bg-gray-100 text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Done: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-orange-100 text-orange-800",
      Low: "bg-green-100 text-green-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-300 mb-4 slow-bounce">
          <Archive className="h-14 w-14" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {workspaceId
            ? "Nothing Archived in This Workspace"
            : "No Archived Tasks Yet"}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {workspaceId
            ? "Looks like you haven’t archived anything yet."
            : "Your archived tasks will show up here for reference."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Archived Tasks</h1>
        <p className="text-gray-600 mt-2">
          {filteredTasks.length} archived task
          {filteredTasks.length !== 1 ? "s" : ""}
          {workspaceId && ` in this workspace`}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card
            key={task._id}
            className="hover:shadow-md transition-shadow duration-200 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2 text-gray-800">
                  <Link
                    to={`/workspaces/${
                      typeof task.project?.workspace === "object"
                        ? task.project.workspace._id
                        : task.project?.workspace
                    }/projects/${task.project?._id}/tasks/${task._id}`}
                    className="hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {task.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </CardTitle>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnarchive(task._id)}
                  disabled={isArchiving}
                >
                  <ArchiveRestore className="h-4 w-4 mr-1" />
                  Unarchive
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {task.description && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-500" />
                  <p className="line-clamp-3">{task.description}</p>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {task.project && typeof task.project === "object" && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Folder className="h-4 w-4 text-gray-500" />
                  <span>{task.project.title}</span>
                </div>
              )}

              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    {task.assignees.length} assignee
                    {task.assignees.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArchivedTasks;
