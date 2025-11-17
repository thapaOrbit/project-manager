import type { CreateProjectFormData } from "@/components/project/create-project";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};



export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};



export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      projectData 
    }: { 
      projectId: string; 
      projectData: any 
    }) => {
      return updateData(`/projects/${projectId}/settings`, projectData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update project";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      return deleteData(`/projects/${projectId}`);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
      
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete project";
      toast.error(errorMessage);
    },
  });
};