import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
} from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";

export default function NotificationsPage() {
  const { data: notifications = [] } = useNotificationsQuery();
  const markAsReadMutation = useMarkAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const navigate = useNavigate();

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
        `/dashboard/workspaces/${notification.data.workspaceId}/projects/${notification.data.projectId}/tasks/${notification.data.taskId}`
      );
    } else if (notification.data?.projectId && notification.data?.workspaceId) {
      navigate(
        `/dashboard/workspaces/${notification.data.workspaceId}/projects/${notification.data.projectId}`
      );
    } else if (notification.data?.workspaceId) {
      navigate(`/dashboard/workspaces/${notification.data.workspaceId}`);
    } else {
      navigate("/dashboard");
    }
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

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            <span className="text-muted-foreground">
              ({notifications.length})
            </span>
          </div>

          {notifications.length > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                !notification.read
                  ? "bg-muted/50 border-l-4 border-l-blue-500"
                  : "bg-card"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xl mt-1">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsReadMutation.mutate(notification._id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, notification._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </div>

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
}
