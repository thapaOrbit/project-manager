
import type { ProjectStatus, Task, TaskStatus } from "@/types";

export const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "*",
];


export const getProjectStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "On Hold":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Planning":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export const getProjectProgress = (tasks: { status: TaskStatus }[]) => {
  if (tasks.length === 0) return 0;

  let totalScore = 0;
  
  tasks.forEach(task => {
    switch (task.status) {
      case "Done":
        totalScore += 1; // 100% complete
        break;
      case "In Progress":
        totalScore += 0.5; // 50% complete
        break;
      case "To Do":
        totalScore += 0; // 0% complete
        break;
      default:
        totalScore += 0;
    }
  });

  const progress = Math.round((totalScore / tasks.length) * 100);
  return progress;
};

