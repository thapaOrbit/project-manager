import Notification from "../models/notification.js";
import Task from "../models/task.js";
import Project from "../models/project.js";
import Workspace from "../models/workspace.js";
import User from "../models/user.js";

class NotificationService {
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);

      return notification;
    } catch (error) {
      throw error;
    }
  }

  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async createNotificationsForUsers(userIds, notificationData) {
    try {
      const notifications = userIds.map((userId) => ({
        ...notificationData,
        user: userId,
      }));

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error("Error creating multiple notifications:", error);
      throw error;
    }
  }

  async notifyTaskAssigned(taskId, assignedByUserId, assignedToUserIds) {
    const task = await Task.findById(taskId);
    const assignedBy = await User.findById(assignedByUserId);

    if (!task || !assignedBy) {
      return;
    }

    const notificationData = {
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: `${assignedBy.name} assigned you to "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        assignedBy: assignedBy._id,
        assignedByName: assignedBy.name,
      },
      priority: "HIGH",
      relatedUsers: [assignedByUserId],
    };

    await this.createNotificationsForUsers(assignedToUserIds, notificationData);
  }

  async notifyTaskMentioned(
    taskId,
    mentionedByUserId,
    mentionedUserIds,
    commentText
  ) {
    const task = await Task.findById(taskId);
    const mentionedBy = await User.findById(mentionedByUserId);

    if (!task || !mentionedBy) return;

    const notificationData = {
      type: "TASK_MENTIONED",
      title: "You were mentioned",
      message: `${mentionedBy.name} mentioned you in a comment on "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        mentionedBy: mentionedBy._id,
        mentionedByName: mentionedBy.name,
        commentPreview: commentText.substring(0, 100),
      },
      priority: "HIGH",
      relatedUsers: [mentionedByUserId],
    };

    await this.createNotificationsForUsers(mentionedUserIds, notificationData);
  }

  async notifyTaskDueSoon(taskId) {
    const task = await Task.findById(taskId).populate("assignees");
    if (!task || !task.dueDate) return;

    const assigneeIds = task.assignees.map((assignee) => assignee._id);
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])];

    const notificationData = {
      type: "TASK_DUE_SOON",
      title: "Task Due Soon",
      message: `"${task.title}" is due tomorrow`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        dueDate: task.dueDate,
      },
      priority: "HIGH",
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskDueToday(taskId) {
    const task = await Task.findById(taskId).populate("assignees");
    if (!task || !task.dueDate) return;

    const assigneeIds = task.assignees.map((assignee) => assignee._id);
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])];

    const notificationData = {
      type: "TASK_DUE_TODAY",
      title: "Task Due Today",
      message: `"${task.title}" is due today`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        dueDate: task.dueDate,
      },
      priority: "URGENT",
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskOverdue(taskId) {
    const task = await Task.findById(taskId).populate("assignees");
    if (!task || !task.dueDate) return;

    const assigneeIds = task.assignees.map((assignee) => assignee._id);
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])];

    const notificationData = {
      type: "TASK_OVERDUE",
      title: "Task Overdue",
      message: `"${task.title}" is overdue`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        dueDate: task.dueDate,
      },
      priority: "URGENT",
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskStatusChanged(taskId, changedByUserId, oldStatus, newStatus) {
    const task = await Task.findById(taskId);
    const changedBy = await User.findById(changedByUserId);

    if (!task || !changedBy) {
      return;
    }

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];
    const creatorId = task.createdBy;

    const userIds = [
      ...new Set([...assigneeIds, ...watcherIds, creatorId]),
    ].filter((userId) => userId.toString() !== changedByUserId.toString());

    const notificationData = {
      type: "TASK_STATUS_CHANGED",
      title: "Task Status Updated",
      message: `${changedBy.name} changed "${task.title}" from ${oldStatus} to ${newStatus}`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        changedBy: changedBy._id,
        changedByName: changedBy.name,
        oldStatus,
        newStatus,
      },
      priority: "MEDIUM",
      relatedUsers: [changedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskPriorityChanged(
    taskId,
    changedByUserId,
    oldPriority,
    newPriority
  ) {
    const task = await Task.findById(taskId);
    const changedBy = await User.findById(changedByUserId);

    if (!task || !changedBy) return;

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])].filter(
      (userId) => userId.toString() !== changedByUserId.toString()
    );

    const notificationData = {
      type: "TASK_PRIORITY_CHANGED",
      title: "Task Priority Updated",
      message: `${changedBy.name} changed priority of "${task.title}" from ${oldPriority} to ${newPriority}`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        changedBy: changedBy._id,
        changedByName: changedBy.name,
        oldPriority,
        newPriority,
      },
      priority: "MEDIUM",
      relatedUsers: [changedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskUpdated(taskId, updatedByUserId, updatedFields) {
    const task = await Task.findById(taskId);
    const updatedBy = await User.findById(updatedByUserId);

    if (!task || !updatedBy) return;

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])].filter(
      (userId) => userId.toString() !== updatedByUserId.toString()
    );

    const notificationData = {
      type: "TASK_UPDATED",
      title: "Task Updated",
      message: `${updatedBy.name} updated "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        updatedBy: updatedBy._id,
        updatedByName: updatedBy.name,
        updatedFields,
      },
      priority: "LOW",
      relatedUsers: [updatedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskCommentAdded(taskId, commentAuthorId, commentText) {
    const task = await Task.findById(taskId);
    const commentAuthor = await User.findById(commentAuthorId);

    if (!task || !commentAuthor) return;

    const watcherIds = task.watchers || [];
    const assigneeIds = task.assignees;

    const userIds = [...new Set([...watcherIds, ...assigneeIds])].filter(
      (userId) => userId.toString() !== commentAuthorId.toString()
    );

    const notificationData = {
      type: "TASK_COMMENT_ADDED",
      title: "New Comment",
      message: `${commentAuthor.name} commented on "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        commentAuthor: commentAuthor._id,
        commentAuthorName: commentAuthor.name,
        commentPreview: commentText.substring(0, 100),
      },
      priority: "MEDIUM",
      relatedUsers: [commentAuthorId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskSubtaskAdded(taskId, addedByUserId, subtaskTitle) {
    const task = await Task.findById(taskId);
    const addedBy = await User.findById(addedByUserId);

    if (!task || !addedBy) return;

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];

    const userIds = [...new Set([...assigneeIds, ...watcherIds])].filter(
      (userId) => userId.toString() !== addedByUserId.toString()
    );

    const notificationData = {
      type: "TASK_SUBTASK_ADDED",
      title: "New Subtask Added",
      message: `${addedBy.name} added a subtask to "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        addedBy: addedBy._id,
        addedByName: addedBy.name,
        subtaskTitle,
      },
      priority: "LOW",
      relatedUsers: [addedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskCompleted(taskId, completedByUserId) {
    const task = await Task.findById(taskId);
    const completedBy = await User.findById(completedByUserId);

    if (!task || !completedBy) return;

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];
    const creatorId = task.createdBy;

    const userIds = [
      ...new Set([...assigneeIds, ...watcherIds, creatorId]),
    ].filter((userId) => userId.toString() !== completedByUserId.toString());

    const notificationData = {
      type: "TASK_COMPLETED",
      title: "Task Completed",
      message: `${completedBy.name} completed "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        completedBy: completedBy._id,
        completedByName: completedBy.name,
      },
      priority: "MEDIUM",
      relatedUsers: [completedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyTaskDeleted(taskId, deletedByUserId, taskTitle, projectId) {
    const deletedBy = await User.findById(deletedByUserId);
    if (!deletedBy) return;

    const task = await Task.findById(taskId);
    if (!task) return;

    const assigneeIds = task.assignees;
    const watcherIds = task.watchers || [];
    const creatorId = task.createdBy;

    const userIds = [
      ...new Set([...assigneeIds, ...watcherIds, creatorId]),
    ].filter((userId) => userId.toString() !== deletedByUserId.toString());

    const notificationData = {
      type: "TASK_DELETED",
      title: "Task Deleted",
      message: `${deletedBy.name} deleted task "${taskTitle}"`,
      data: {
        taskTitle,
        projectId,
        deletedBy: deletedBy._id,
        deletedByName: deletedBy.name,
      },
      priority: "HIGH",
      relatedUsers: [deletedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  // PROJECT NOTIFICATIONS

  async notifyProjectCreated(projectId, createdByUserId) {
    const project = await Project.findById(projectId);
    const createdBy = await User.findById(createdByUserId);
    const workspace = await Workspace.findById(project.workspace);

    if (!project || !createdBy || !workspace) return;

    const workspaceMemberIds = workspace.members.map((member) =>
      member.user.toString()
    );
    const userIds = workspaceMemberIds.filter(
      (userId) => userId !== createdByUserId.toString()
    );

    const notificationData = {
      type: "PROJECT_CREATED",
      title: "New Project Created",
      message: `${createdBy.name} created new project "${project.title}"`,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        workspaceId: project.workspace,
        createdBy: createdBy._id,
        createdByName: createdBy.name,
      },
      priority: "MEDIUM",
      relatedUsers: [createdByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyProjectUpdated(projectId, updatedByUserId, updatedFields) {
    const project = await Project.findById(projectId);
    const updatedBy = await User.findById(updatedByUserId);

    if (!project || !updatedBy) return;

    const projectMemberIds = project.members.map((member) =>
      member.user.toString()
    );

    const userIds = projectMemberIds.filter(
      (userId) => userId !== updatedByUserId.toString()
    );

    const notificationData = {
      type: "PROJECT_UPDATED",
      title: "Project Updated",
      message: `${updatedBy.name} updated project "${project.title}"`,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        workspaceId: project.workspace,
        updatedBy: updatedBy._id,
        updatedByName: updatedBy.name,
        updatedFields,
      },
      priority: "LOW",
      relatedUsers: [updatedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyProjectDueSoon(projectId) {
    const project = await Project.findById(projectId);
    if (!project || !project.dueDate) return;

    const projectMemberIds = project.members.map((member) => member.user);

    const notificationData = {
      type: "PROJECT_DUE_SOON",
      title: "Project Due Soon",
      message: `"${project.title}" is due tomorrow`,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        workspaceId: project.workspace,
        dueDate: project.dueDate,
      },
      priority: "HIGH",
    };

    await this.createNotificationsForUsers(projectMemberIds, notificationData);
  }

  async notifyProjectDueToday(projectId) {
    const project = await Project.findById(projectId);
    if (!project || !project.dueDate) return;

    const projectMemberIds = project.members.map((member) => member.user);

    const notificationData = {
      type: "PROJECT_DUE_TODAY",
      title: "Project Due Today",
      message: `"${project.title}" is due today`,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        workspaceId: project.workspace,
        dueDate: project.dueDate,
      },
      priority: "URGENT",
    };

    await this.createNotificationsForUsers(projectMemberIds, notificationData);
  }

  async notifyProjectOverdue(projectId) {
    const project = await Project.findById(projectId);
    if (!project || !project.dueDate) return;

    const projectMemberIds = project.members.map((member) => member.user);

    const notificationData = {
      type: "PROJECT_OVERDUE",
      title: "Project Overdue",
      message: `"${project.title}" is overdue`,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        workspaceId: project.workspace,
        dueDate: project.dueDate,
      },
      priority: "URGENT",
    };

    await this.createNotificationsForUsers(projectMemberIds, notificationData);
  }

  async notifyProjectDeleted(
    projectId,
    deletedByUserId,
    projectTitle,
    workspaceId
  ) {
    const deletedBy = await User.findById(deletedByUserId);
    if (!deletedBy) return;

    const project = await Project.findById(projectId);
    if (!project) return;

    const projectMemberIds = project.members.map((member) => member.user);

    const userIds = projectMemberIds.filter(
      (userId) => userId.toString() !== deletedByUserId.toString()
    );

    const notificationData = {
      type: "PROJECT_DELETED",
      title: "Project Deleted",
      message: `${deletedBy.name} deleted project "${projectTitle}"`,
      data: {
        projectTitle,
        workspaceId,
        deletedBy: deletedBy._id,
        deletedByName: deletedBy.name,
      },
      priority: "HIGH",
      relatedUsers: [deletedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyWorkspaceInvitation(
    workspaceId,
    invitedByUserId,
    invitedUserIds
  ) {
    const workspace = await Workspace.findById(workspaceId);
    const invitedBy = await User.findById(invitedByUserId);

    if (!workspace || !invitedBy) return;

    const notificationData = {
      type: "WORKSPACE_INVITATION",
      title: "Workspace Invitation",
      message: `${invitedBy.name} invited you to join "${workspace.name}"`,
      data: {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        invitedBy: invitedBy._id,
        invitedByName: invitedBy.name,
        role: "member",
      },
      priority: "HIGH",
      relatedUsers: [invitedByUserId],
    };

    await this.createNotificationsForUsers(invitedUserIds, notificationData);
  }

  async notifyWorkspaceUpdated(workspaceId, updatedByUserId, updatedFields) {
    const workspace = await Workspace.findById(workspaceId);
    const updatedBy = await User.findById(updatedByUserId);

    if (!workspace || !updatedBy) return;

    const workspaceMemberIds = workspace.members.map((member) =>
      member.user.toString()
    );

    const userIds = workspaceMemberIds.filter(
      (userId) => userId !== updatedByUserId.toString()
    );

    const notificationData = {
      type: "WORKSPACE_UPDATED",
      title: "Workspace Updated",
      message: `${updatedBy.name} updated workspace "${workspace.name}"`,
      data: {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        updatedBy: updatedBy._id,
        updatedByName: updatedBy.name,
        updatedFields,
      },
      priority: "LOW",
      relatedUsers: [updatedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyWorkspaceOwnershipTransferred(
    workspaceId,
    previousOwnerId,
    newOwnerId
  ) {
    const workspace = await Workspace.findById(workspaceId);
    const previousOwner = await User.findById(previousOwnerId);
    const newOwner = await User.findById(newOwnerId);

    if (!workspace || !previousOwner || !newOwner) return;

    const workspaceMemberIds = workspace.members.map((member) =>
      member.user.toString()
    );

    const notificationData = {
      type: "WORKSPACE_OWNERSHIP_TRANSFERRED",
      title: "Workspace Ownership Transferred",
      message: `${previousOwner.name} transferred ownership of "${workspace.name}" to ${newOwner.name}`,
      data: {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        previousOwner: previousOwner._id,
        previousOwnerName: previousOwner.name,
        newOwner: newOwner._id,
        newOwnerName: newOwner.name,
      },
      priority: "HIGH",
      relatedUsers: [previousOwnerId, newOwnerId],
    };

    await this.createNotificationsForUsers(
      workspaceMemberIds,
      notificationData
    );
  }

  async notifyNewMemberJoined(workspaceId, newMemberId) {
    const workspace = await Workspace.findById(workspaceId);
    const newMember = await User.findById(newMemberId);

    if (!workspace || !newMember) return;

    const workspaceMemberIds = workspace.members.map((member) =>
      member.user.toString()
    );

    const userIds = workspaceMemberIds.filter(
      (userId) => userId !== newMemberId.toString()
    );

    const notificationData = {
      type: "NEW_MEMBER_JOINED",
      title: "New Member Joined",
      message: `${newMember.name} joined "${workspace.name}"`,
      data: {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        newMember: newMember._id,
        newMemberName: newMember.name,
      },
      priority: "MEDIUM",
      relatedUsers: [newMemberId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  async notifyWorkspaceDeleted(workspaceId, deletedByUserId, workspaceName) {
    const deletedBy = await User.findById(deletedByUserId);
    if (!deletedBy) return;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return;

    const workspaceMemberIds = workspace.members.map((member) =>
      member.user.toString()
    );

    const userIds = workspaceMemberIds.filter(
      (userId) => userId !== deletedByUserId.toString()
    );

    const notificationData = {
      type: "WORKSPACE_DELETED",
      title: "Workspace Deleted",
      message: `${deletedBy.name} deleted workspace "${workspaceName}"`,
      data: {
        workspaceName,
        deletedBy: deletedBy._id,
        deletedByName: deletedBy.name,
      },
      priority: "HIGH",
      relatedUsers: [deletedByUserId],
    };

    await this.createNotificationsForUsers(userIds, notificationData);
  }

  // COMMENT NOTIFICATIONS

  async notifyCommentMentioned(
    commentId,
    mentionedByUserId,
    mentionedUserIds,
    taskId,
    commentText
  ) {
    const task = await Task.findById(taskId);
    const mentionedBy = await User.findById(mentionedByUserId);

    if (!task || !mentionedBy) return;

    const notificationData = {
      type: "COMMENT_MENTIONED",
      title: "You were mentioned",
      message: `${mentionedBy.name} mentioned you in a comment on "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        commentId,
        mentionedBy: mentionedBy._id,
        mentionedByName: mentionedBy.name,
        commentPreview: commentText.substring(0, 100),
      },
      priority: "HIGH",
      relatedUsers: [mentionedByUserId],
    };

    await this.createNotificationsForUsers(mentionedUserIds, notificationData);
  }

  async notifyCommentReply(
    commentId,
    repliedByUserId,
    parentCommentAuthorId,
    taskId,
    replyText
  ) {
    const task = await Task.findById(taskId);
    const repliedBy = await User.findById(repliedByUserId);

    if (!task || !repliedBy) return;

    const notificationData = {
      type: "COMMENT_REPLY",
      title: "New Reply to Your Comment",
      message: `${repliedBy.name} replied to your comment on "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        commentId,
        repliedBy: repliedBy._id,
        repliedByName: repliedBy.name,
        replyPreview: replyText.substring(0, 100),
      },
      priority: "MEDIUM",
      relatedUsers: [repliedByUserId],
    };

    await this.createNotificationsForUsers(
      [parentCommentAuthorId],
      notificationData
    );
  }

  async notifyReactionAdded(
    reactionId,
    reactedByUserId,
    commentAuthorId,
    taskId,
    emoji
  ) {
    const task = await Task.findById(taskId);
    const reactedBy = await User.findById(reactedByUserId);

    if (!task || !reactedBy) return;

    const notificationData = {
      type: "REACTION_ADDED",
      title: "New Reaction",
      message: `${reactedBy.name} reacted with ${emoji} to your comment on "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.project,
        reactionId,
        reactedBy: reactedBy._id,
        reactedByName: reactedBy.name,
        emoji,
      },
      priority: "LOW",
      relatedUsers: [reactedByUserId],
    };

    await this.createNotificationsForUsers([commentAuthorId], notificationData);
  }

  async getUserNotifications(userId, options = {}) {
    const { limit = 50, skip = 0, unreadOnly = false } = options;

    const query = { user: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("relatedUsers", "name profilePicture");

    return notifications;
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (notification && !notification.read) {
      notification.read = true;
      await notification.save();
    }

    return notification;
  }

  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    return result;
  }

  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    return count;
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
      });

      if (!notification) {
        return null;
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }
}

export default new NotificationService();
