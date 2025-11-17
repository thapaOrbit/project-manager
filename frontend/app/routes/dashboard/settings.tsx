import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Settings, Trash2 } from "lucide-react";

import { useAuth } from "@/provider/auth-context";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
  useGetWorkspaceDetailsQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useTransferWorkspaceMutation,
} from "@/hooks/use-workspace";
import type { Workspace, User } from "@/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { colorOptions } from "@/components/workspace/create-workspace";
import { cn } from "@/lib/utils";

const workspaceSchema = z.object({
  name: z.string().min(1, { message: "Workspace name is required" }),
  description: z.string().optional(),
  color: z.string().min(1, { message: "Color is required" }),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

const SettingsPage = () => {
  const { user } = useAuth();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

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

  const {
    data: workspace,
    isLoading,
    error,
  } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace | undefined;
    isLoading: boolean;
    error: any;
  };

  const updateWorkspaceMutation = useUpdateWorkspaceMutation();
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation();
  const transferWorkspaceMutation = useTransferWorkspaceMutation();

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: colorOptions[0],
    },
  });

  useEffect(() => {
    if (workspace) {
      const workspaceData = workspace as Workspace;
      form.reset({
        name: workspaceData.name || "",
        description: workspaceData.description || "",
        color: workspaceData.color || colorOptions[0],
      });
    }
  }, [workspace, form]);

  const currentUserMember = (workspace as Workspace)?.members?.find(
    (member) => {
      if (!member?.user) return false;
      const memberUserId =
        typeof member.user === "string" ? member.user : member.user._id;
      const currentUserId = user?._id;
      return memberUserId === currentUserId;
    }
  );

  // Permission checks
  const isOwner = currentUserMember?.role === "owner";
  const isAdmin = currentUserMember?.role === "admin";
  const canEdit = isOwner || isAdmin; // Owners + Admins can edit
  const canTransferOrDelete = isOwner; // Only Owners can transfer/delete

  const handleSaveChanges = async (values: WorkspaceFormData) => {
    if (!workspaceId || !canEdit) {
      toast.error("You are not authorized to update this workspace");
      return;
    }

    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        updates: values,
      });
      toast.success("Workspace updated successfully");
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
  };

  const handleTransferWorkspace = () => {
    if (!canTransferOrDelete) {
      toast.error("You are not authorized to transfer ownership");
      return;
    }

    const workspaceData = workspace as Workspace;
    const otherMembers = workspaceData.members?.filter((member) => {
      if (!member?.user) return false;
      const memberUserId =
        typeof member.user === "string" ? member.user : member.user._id;
      return memberUserId !== user?._id && member.role !== "owner";
    });

    if (!otherMembers || otherMembers.length === 0) {
      toast.error("No other members available to transfer ownership to");
      return;
    }

    setSelectedMemberId(null);
    setShowTransferModal(true);
  };

  const handleDeleteWorkspace = () => {
    if (!canTransferOrDelete) {
      toast.error("You are not authorized to delete this workspace");
      return;
    }

    showConfirmation(
      {
        title: "Delete Workspace",
        description:
          "Are you sure you want to delete this workspace? This action cannot be undone. All projects, tasks, and data will be permanently removed.",
        confirmText: "Delete Workspace",
        variant: "destructive",
      },
      async () => {
        if (!workspaceId) return;

        try {
          await deleteWorkspaceMutation.mutateAsync(workspaceId);
          toast.success("Workspace deleted successfully");
          navigate("/workspaces");
        } catch (error) {
          console.error("Error deleting workspace:", error);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading workspace settings...</div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          Failed to load workspace settings
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Settings className="size-6 text-foreground" />
              <h1 className="text-2xl font-bold tracking-tight">
                Workspace Settings
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your workspace settings and preferences
            </p>
          </div>

          <Separator />

          {/* Workspace Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSaveChanges)}
                  className="space-y-6"
                >
                  {/* Workspace Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Workspace Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter workspace name"
                            className="max-w-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your workspace..."
                            rows={3}
                            className="max-w-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Workspace Color */}
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Workspace Color
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-3 flex-wrap p-2">
                            {colorOptions.map((color) => (
                              <div
                                key={color}
                                onClick={() => field.onChange(color)}
                                className={cn(
                                  "w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                                  field.value === color &&
                                    "ring-2 ring-offset-2 ring-blue-500"
                                )}
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Save Button */}
                  <div className="flex pt-4 justify-end">
                    <Button
                      type="submit"
                      className="w-fit"
                      disabled={updateWorkspaceMutation.isPending || !canEdit}
                    >
                      {updateWorkspaceMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Transfer Workspace Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Transfer Workspace</CardTitle>
              <CardDescription>
                Transfer ownership of this workspace to another member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Select a member to become the new owner of this workspace.
                </p>
                <p className="mt-1">
                  You will become a regular member after transfer.
                </p>
              </div>
              <div className="flex pt-4 justify-end">
                <Button
                  onClick={handleTransferWorkspace}
                  variant="secondary"
                  className="w-fit"
                  disabled={
                    transferWorkspaceMutation.isPending || !canTransferOrDelete
                  }
                >
                  Select Member to Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-red-700 text-xl">
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Irreversible action for your Workspace
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex pt-4 justify-end">
                <Button
                  onClick={handleDeleteWorkspace}
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={
                    deleteWorkspaceMutation.isPending || !canTransferOrDelete
                  }
                >
                  <Trash2 className="size-4" />
                  {deleteWorkspaceMutation.isPending
                    ? "Deleting..."
                    : "Delete Workspace"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Workspace Modal */}
          {showTransferModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Transfer Workspace Ownership</CardTitle>
                  <CardDescription>
                    Select a member to transfer ownership. This action cannot be
                    undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Member List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {workspace.members
                      .filter((member) => {
                        if (!member?.user) return false;
                        const memberId =
                          typeof member.user === "string"
                            ? member.user
                            : member.user._id;
                        return memberId !== user?._id;
                      })
                      .map((member) => {
                        if (!member.user) return null;
                        const memberUser =
                          typeof member.user === "string"
                            ? {
                                _id: member.user,
                                email: member.user,
                                name: "Member",
                              }
                            : member.user;

                        return (
                          <div
                            key={memberUser._id}
                            onClick={() => setSelectedMemberId(memberUser._id)}
                            className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer ${
                              selectedMemberId === memberUser._id
                                ? "bg-blue-50 border-blue-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border ${
                                selectedMemberId === memberUser._id
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            />
                            <div>
                              <p className="font-medium">{memberUser.name}</p>
                              <p className="text-sm text-gray-500">
                                {memberUser.email}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowTransferModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!selectedMemberId || !workspaceId) return;
                        try {
                          await transferWorkspaceMutation.mutateAsync({
                            workspaceId,
                            newOwnerId: selectedMemberId,
                          });
                          toast.success(
                            "Workspace ownership transferred successfully"
                          );
                          setShowTransferModal(false);
                          navigate(`/workspaces/${workspaceId}`);
                        } catch (error) {
                          console.error("Error transferring workspace:", error);
                        }
                      }}
                      disabled={
                        !selectedMemberId || transferWorkspaceMutation.isPending
                      }
                    >
                      {transferWorkspaceMutation.isPending
                        ? "Transferring..."
                        : "Transfer Ownership"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Confirmation Dialog */}
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
      </div>
    </div>
  );
};

export default SettingsPage;
