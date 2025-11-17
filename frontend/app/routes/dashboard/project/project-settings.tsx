import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { UseProjectQuery } from "@/hooks/use-project";
import { useAuth } from "@/provider/auth-context";
import { ProjectStatus, type Project } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useEffect } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUpdateProject, useDeleteProject } from "@/hooks/use-project";

const projectSchema = z.object({
  title: z.string().min(1, { message: "Project title is required" }),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string().min(1, { message: "Start date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  tags: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const ProjectSettings = () => {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const { user } = useAuth();
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: any[];
      project: Project;
    };
    isLoading: boolean;
  };

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

  // Form setup
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Planning",
      startDate: "",
      dueDate: "",
      tags: "",
    },
  });

  // Set form values when data loads
  useEffect(() => {
    if (data?.project) {
      const project = data.project;
      form.reset({
        title: project.title,
        description: project.description || "",
        status: project.status as any,
        startDate: project.startDate
          ? format(new Date(project.startDate), "yyyy-MM-dd")
          : "",
        dueDate: project.dueDate
          ? format(new Date(project.dueDate), "yyyy-MM-dd")
          : "",
        tags: project.tags?.join(", ") || "",
      });
    }
  }, [data, form]);

  useEffect(() => {
    document.body.classList.add("no-sidebar");

    return () => {
      document.body.classList.remove("no-sidebar");
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold">Project not found</div>
      </div>
    );
  }

  const { project } = data;

  // Check if user is workspace owner (manager)
  const isOwner = project.members.some((member: any) => {
    const isUser = member.user._id === user?._id;
    const isOwnerRole = member.role === "manager";
    return isUser && isOwnerRole;
  });

  const handleSaveChanges = (values: ProjectFormData) => {
    if (!projectId) return;

    const projectData = {
      ...values,
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()) : [],
    };

    updateProject({ projectId, projectData });
  };

  const handleDeleteProject = () => {
    showConfirmation(
      {
        title: "Delete Project",
        description:
          "Are you sure you want to delete this project? This action cannot be undone. All tasks and data will be permanently removed.",
        confirmText: "Delete Project",
        variant: "destructive",
      },
      () => {
        if (!projectId || !workspaceId) return;
        deleteProject(
          { projectId },
          {
            onSuccess: () => {
              toast.success("Project deleted successfully");
              navigate(`/workspaces/${workspaceId}`);
            },
          }
        );
      }
    );
  };

  // Function to get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <BackButton />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Project Settings
                </h1>
                <p className="text-muted-foreground">
                  Update your project details or delete the project
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSaveChanges)}
                  className="space-y-6"
                >
                  {/* Project Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter project title" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your project..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-6">
                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Project Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ProjectStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Tags separated by comma"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-full justify-start text-left font-normal" +
                                  (!field.value ? " text-muted-foreground" : "")
                                }
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? format(date, "yyyy-MM-dd") : ""
                                  );
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-full justify-start text-left font-normal" +
                                  (!field.value ? " text-muted-foreground" : "")
                                }
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? format(date, "yyyy-MM-dd") : ""
                                  );
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex pt-4">
                    <Button
                      type="submit"
                      className="w-fit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Project Members Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="size-5 text-foreground" />
                <div>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>
                    View all members and their roles in this project.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.members.map((member: any) => (
                  <div
                    key={member.user._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={member.user.profilePicture}
                          alt={member.user.name}
                        />
                        <AvatarFallback className="text-sm font-medium">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.role === "owner"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : member.role === "admin" ||
                                member.role === "manager"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
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
                    Irreversible action for your project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDeleteProject}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </CardContent>
          </Card>

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

export default ProjectSettings;
