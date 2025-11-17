import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskDueDateSelector } from "@/components/task/task-due-date-selector";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
  useArchiveTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: archiveTask, isPending: isArchiving } =
    useArchiveTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  const {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    variant,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  } = useConfirmDialog();

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  const projectMembers = project?.members || [];

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success(isUserWatching ? "Task unwatched" : "Task watched");
        },
        onError: () => {
          toast.error(
            isUserWatching ? "Failed to unwatch task" : "Failed to watch task"
          );
        },
      }
    );
  };

  const handleArchiveTask = () => {
    archiveTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success(`Task ${task.isArchived ? "unarchived" : "archived"}`);
        },
        onError: () => {
          toast.error(
            `Failed to ${task.isArchived ? "unarchive" : "archive"} task`
          );
        },
      }
    );
  };

  const handleDeleteTask = () => {
    showConfirmation(
      {
        title: "Delete Task",
        description:
          "Are you sure you want to delete this task? This action cannot be undone.",
        confirmText: "Delete Task",
        variant: "destructive",
      },
      () => {
        deleteTask(
          { taskId: task._id },
          {
            onError: (error: any) => {
              toast.error(
                error.response?.data?.message || "Failed to delete task"
              );
            },
          }
        );
      }
    );
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="mb-2 md:mb-0">
            <BackButton />
          </div>

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleArchiveTask}
            className="w-fit"
            disabled={isArchiving}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    task.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "Medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                  }
                >
                  {task.priority} Priority
                </Badge>
                <TaskStatusSelector status={task.status} taskId={task._id} />
              </div>

              <Button
                variant={"destructive"}
                size="sm"
                onClick={handleDeleteTask}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader />
                    Deleting...
                  </>
                ) : (
                  "Delete Task"
                )}
              </Button>
            </div>

            <TaskTitle title={task.title} taskId={task._id} />

            <div className="text-sm text-muted-foreground mb-4">
              Created at:{" "}
              {formatDistanceToNow(new Date(task.createdAt), {
                addSuffix: true,
              })}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={projectMembers as any}
            />

            <TaskPrioritySelector priority={task.priority} taskId={task._id} />

            <TaskDueDateSelector
              dueDate={task.dueDate}
              taskId={task._id}
              isCompleted={task.status === "Done"}
            />

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
          </div>

          <CommentSection
            taskId={task._id}
            members={projectMembers.map((member) => member.user)}
            currentUser={user || undefined}
          />
        </div>

        <div className="lg:w-96 space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <Watchers watchers={task.watchers || []} />
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <TaskActivity resourceId={task._id} />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={isOpen}
        onOpenChange={hideConfirmation}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
      />
    </div>
  );
};

export default TaskDetails;
