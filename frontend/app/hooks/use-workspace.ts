import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    onSuccess: () => {
      // Invalidate workspaces list after creating a new one
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
     
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create workspace";
      toast.error(errorMessage);
    },
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData<Workspace[]>("/workspaces"),
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};


export const useGetWorkspaceStatsQuery = (workspaceId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: options?.enabled ?? true,
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};

export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workspaceId, updates }: { workspaceId: string; updates: any }) =>
      updateData(`/workspaces/${workspaceId}`, updates),
    onSuccess: (data, variables) => {
      // Force refetch workspaces list to update header/sidebar
      queryClient.refetchQueries({
        queryKey: ["workspaces"],
      });
      
      // Invalidate specific workspace cache
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId, "details"],
      });
      
      
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update workspace";
      toast.error(errorMessage);
    },
  });
};


export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workspaceId: string) =>
      deleteData(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete workspace";
      toast.error(errorMessage);
    },
  });
};

export const useTransferWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workspaceId, newOwnerId }: { workspaceId: string; newOwnerId: string }) =>
      postData(`/workspaces/${workspaceId}/transfer`, { newOwnerId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId, "details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to transfer workspace";
      toast.error(errorMessage);
    },
  });
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
    onSuccess: (data, variables) => {
      // Invalidate workspace details to reflect new member
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId, "details"],
      });
     
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to invite member";
      toast.error(errorMessage);
    },
  });
};

export const useAcceptInviteByTokenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
    onSuccess: () => {
      // Invalidate workspaces list after accepting invite
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to accept invitation";
      toast.error(errorMessage);
    },
  });
};

export const useAcceptGenerateInviteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
    onSuccess: () => {
      // Invalidate workspaces list after accepting invite
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
   
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to accept invitation";
      toast.error(errorMessage);
    },
  });
};