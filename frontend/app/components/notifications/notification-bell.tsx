import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/hooks/use-notification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotificationsQuery();
  const { data: unreadData } = useUnreadCountQuery();
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const {
    isOpen: isConfirmOpen,
    title,
    description,
    confirmText,
    cancelText,
    variant,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  } = useConfirmDialog();

  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    if (
      notification.data?.taskId &&
      notification.data?.projectId &&
      notification.data?.workspaceId
    ) {
      navigate(
        `workspaces/${notification.data.workspaceId}/projects/${notification.data.projectId}/tasks/${notification.data.taskId}`
      );
    } else if (notification.data?.projectId && notification.data?.workspaceId) {
      navigate(
        `workspaces/${notification.data.workspaceId}/projects/${notification.data.projectId}`
      );
    } else if (notification.data?.workspaceId) {
      navigate(`workspaces/${notification.data.workspaceId}`);
    } else if (notification.data?.taskId) {
      navigate("my-tasks");
    } else {
      navigate("dashboard");
    }

    setIsOpen(false);
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();

    showConfirmation(
      {
        title: "Delete Notification",
        description:
          "Are you sure you want to delete this notification? This action cannot be undone.",
        confirmText: "Delete",
        variant: "destructive",
      },
      () => {
        deleteMutation.mutate(notificationId);
      }
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "🎯";
      case "TASK_MENTIONED":
      case "COMMENT_MENTIONED":
        return "💬";
      case "TASK_DUE_SOON":
        return "⏰";
      case "TASK_DUE_TODAY":
        return "📅";
      case "TASK_OVERDUE":
        return "🚨";
      case "TASK_COMPLETED":
        return "✅";
      case "PROJECT_CREATED":
        return "📁";
      case "WORKSPACE_INVITATION":
        return "📨";
      case "COMMENT_REPLY":
        return "↩️";
      case "REACTION_ADDED":
        return "👍";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "border-l-red-500";
      case "HIGH":
        return "border-l-orange-500";
      case "MEDIUM":
        return "border-l-blue-500";
      case "LOW":
        return "border-l-gray-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", className)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white",
                  "bg-red-500"
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-96 max-h-96 overflow-y-auto"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-6 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              </div>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="space-y-1 p-1">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={cn(
                  "p-3 cursor-pointer border-l-4",
                  getPriorityColor(notification.priority),
                  !notification.read ? "bg-muted/50" : ""
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="text-lg mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleMarkAsRead(e, notification._id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleDelete(e, notification._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          )}

          {notifications.length > 10 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-sm text-muted-foreground cursor-pointer"
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={hideConfirmation}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
      />
    </>
  );
};
