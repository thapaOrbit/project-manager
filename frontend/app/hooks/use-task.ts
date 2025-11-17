import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";


export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData(`/tasks/${data.projectId}/create-task`, data.taskData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data.project],
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}`),
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      updateData(`/tasks/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      updateData(`/tasks/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      updateData(`/tasks/${data.taskId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; assignees: string[] }) =>
      updateData(`/tasks/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      updateData(`/tasks/${data.taskId}/priority`, { priority: data.priority }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData(`/tasks/${data.taskId}/add-subtask`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      updateData(`/tasks/${data.taskId}/update-subtask/${data.subTaskId}`, {
        completed: data.completed,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};


export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      taskId: string; 
      text: string;
      parentComment?: string | null;
    }) =>
      postData(`/tasks/${data.taskId}/add-comment`, {
        text: data.text,
        parentComment: data.parentComment || null,
      }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
     
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};


export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; commentId: string }) =>
      deleteData(`/tasks/${data.taskId}/comments/${data.commentId}`),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
  
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
      toast.success("Comment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    },
  });
};




export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });
};

export const useAddReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; commentId: string; emoji: string }) =>
      postData(`/tasks/${data.taskId}/comments/${data.commentId}/reactions`, { 
        emoji: data.emoji 
      }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
  
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
      toast.success("Reaction added!");
    },
    onError: (error: any) => {
      toast.error("Failed to add reaction");
    },
  });
};


export const useRemoveReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; commentId: string; emoji: string }) =>
      deleteData(`/tasks/${data.taskId}/comments/${data.commentId}/reactions/${encodeURIComponent(data.emoji)}`),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
      toast.success("Reaction removed"); 
    },
    onError: (error: any) => {
      toast.error("Failed to remove reaction");
    },
  });
};


export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/watch`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useArchiveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/archive`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });
};


export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      deleteData(`/tasks/${data.taskId}`),
    onSuccess: (data: any, variables) => {
    
      queryClient.invalidateQueries({
        queryKey: ["project", data.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks", "user"],
      });
      
      toast.success("Task deleted successfully");
      
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete task");
    },
  });
};



export const useUpdateTaskDueDateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; dueDate: Date | null }) => {
      console.log("Sending due date update:", data); // Debug log
      return updateData(`/tasks/${data.taskId}/due-date`, { 
        dueDate: data.dueDate ? data.dueDate.toISOString() : null 
      });
    },
    onSuccess: (data: any) => {

      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      toast.success("Due date updated successfully"); 
    },
    onError: (error: any) => {
   
      toast.error(error.response?.data?.message || "Failed to update due date");
    },
  });
};


