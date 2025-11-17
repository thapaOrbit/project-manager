import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import User from "../models/user.js";

import NotificationService from "../services/notification-service.js";

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees } =
      req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    });

    project.tasks.push(newTask._id);
    await project.save();

    if (assignees && assignees.length > 0) {
      await NotificationService.notifyTaskAssigned(
        newTask._id,
        req.user._id,
        assignees
      );
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignees", "name profilePicture")
      .populate("watchers", "name profilePicture");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project).populate(
      "members.user",
      "name profilePicture"
    );

    res.status(200).json({ task, project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldTitle = task.title;

    task.title = title;
    await task.save();

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");

    task.description = description;
    await task.save();

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await NotificationService.notifyTaskStatusChanged(
      taskId,
      req.user._id,
      oldStatus,
      status
    );

    if (status === "Done") {
      await NotificationService.notifyTaskCompleted(taskId, req.user._id);
    }

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const oldAssignees = task.assignees;

    const newAssignees = assignees.filter(
      (assignee) => !oldAssignees.includes(assignee)
    );

    task.assignees = assignees;
    await task.save();

    if (newAssignees.length > 0) {
      await NotificationService.notifyTaskAssigned(
        taskId,
        req.user._id,
        newAssignees
      );
    }

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const oldPriority = task.priority;
    task.priority = priority;
    await task.save();

    await NotificationService.notifyTaskPriorityChanged(
      taskId,
      req.user._id,
      oldPriority,
      priority
    );

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const newSubTask = {
      title,
      completed: false,
    };

    task.subtasks.push(newSubTask);
    await task.save();

    await NotificationService.notifyTaskSubtaskAdded(
      taskId,
      req.user._id,
      title
    );

    await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const subTask = task.subtasks.find(
      (subTask) => subTask._id.toString() === subTaskId
    );

    if (!subTask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }

    subTask.completed = completed;
    await task.save();

    await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const activity = await ActivityLog.find({ resourceId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get ALL comments for this task
    const comments = await Comment.find({ task: taskId })
      .populate("author", "name profilePicture email")
      .populate("mentions.user", "name profilePicture")
      .populate("parentComment", "_id")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, parentComment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentCommentDoc.task.toString() !== taskId) {
        return res
          .status(400)
          .json({ message: "Parent comment does not belong to this task" });
      }
    }

    const mentionRegex = /@([a-zA-Z0-9\s]+)/g;
    const mentions = [];
    let match;
    const mentionedUserIds = [];

    while ((match = mentionRegex.exec(text)) !== null) {
      const user = await User.findOne({
        name: { $regex: new RegExp(`^${match[1]}$`, "i") },
      });

      if (user && user._id.toString() !== req.user._id.toString()) {
        mentions.push({
          user: user._id,
          offset: match.index,
          length: match[0].length,
        });
        mentionedUserIds.push(user._id);
      }
    }

    const newComment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
      mentions,
      parentComment: parentComment || null,
    });

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: newComment._id },
      });

      const parentCommentDoc = await Comment.findById(parentComment);
      if (parentCommentDoc.author.toString() !== req.user._id.toString()) {
        await NotificationService.notifyCommentReply(
          newComment._id,
          req.user._id,
          parentCommentDoc.author,
          taskId,
          text
        );
      }
    } else {
      task.comments.push(newComment._id);
      await task.save();
    }

    await newComment.populate([
      { path: "author", select: "name profilePicture" },
      { path: "mentions.user", select: "name profilePicture" },
    ]);

    if (mentionedUserIds.length > 0) {
      await NotificationService.notifyCommentMentioned(
        newComment._id,
        req.user._id,
        mentionedUserIds,
        taskId,
        text
      );
    }

    await NotificationService.notifyTaskCommentAdded(
      taskId,
      req.user._id,
      text
    );

    const activityDescription = parentComment
      ? `replied to a comment: ${
          text.substring(0, 50) + (text.length > 50 ? "..." : "")
        }`
      : `added comment: ${
          text.substring(0, 50) + (text.length > 50 ? "..." : "")
        }`;

    await recordActivity(req.user._id, "added_comment", "Task", taskId, {
      description: activityDescription,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({ parentComment: commentId })
      .populate([
        { path: "author", select: "name profilePicture" },
        { path: "mentions.user", select: "name profilePicture" },
      ])
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate("author", "name profilePicture")
      .populate("task", "title project");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.task._id.toString() !== taskId) {
      return res
        .status(400)
        .json({ message: "Comment does not belong to this task" });
    }

    if (comment.author._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    const project = await Project.findById(comment.task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const replies = await Comment.find({ parentComment: commentId });

    const activityDescription = comment.parentComment
      ? `deleted a reply: ${
          comment.text.substring(0, 50) +
          (comment.text.length > 50 ? "..." : "")
        }`
      : `deleted comment: ${
          comment.text.substring(0, 50) +
          (comment.text.length > 50 ? "..." : "")
        }`;

    await recordActivity(req.user._id, "deleted_comment", "Task", taskId, {
      description: activityDescription,
    });

    if (replies.length > 0) {
      const replyIds = replies.map((reply) => reply._id);
      await Comment.deleteMany({ _id: { $in: replyIds } });
    }

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    } else {
      await Task.findByIdAndUpdate(taskId, { $pull: { comments: commentId } });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({
      message: "Comment deleted successfully",
      deletedReplies: replies.length,
    });
  } catch (error) {
    console.log("Delete comment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addReaction = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, task: taskId });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    comment.reactions = comment.reactions.filter(
      (reaction) =>
        !(
          reaction.user.toString() === userId.toString() &&
          reaction.emoji === emoji
        )
    );

    comment.reactions.push({
      emoji,
      user: userId,
      createdAt: new Date(),
    });

    await comment.save();
    await comment.populate("reactions.user", "name profilePicture");

    if (comment.author.toString() !== userId.toString()) {
      await NotificationService.notifyReactionAdded(
        comment.reactions[comment.reactions.length - 1]._id,
        userId,
        comment.author,
        taskId,
        emoji
      );
    }

    await recordActivity(req.user._id, "added_reaction", "Task", taskId, {
      description: `reacted with ${emoji} to a comment`,
    });

    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeReaction = async (req, res) => {
  try {
    const { taskId, commentId, emoji } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const comment = await Comment.findOne({ _id: commentId, task: taskId });
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    comment.reactions = comment.reactions.filter(
      (reaction) =>
        !(
          reaction.user.toString() === userId.toString() &&
          reaction.emoji === emoji
        )
    );

    await comment.save();
    await comment.populate("reactions.user", "name profilePicture");

    await recordActivity(req.user._id, "removed_reaction", "Task", taskId, {
      description: `removed ${emoji} reaction from a comment`,
    });

    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const isWatching = task.watchers.includes(req.user._id);

    if (!isWatching) {
      task.watchers.push(req.user._id);
    } else {
      task.watchers = task.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await task.save();

    await recordActivity(
      req.user._id,
      isWatching ? "unwatched_task" : "watched_task",
      "Task",
      taskId,
      {
        description: `${
          isWatching ? "stopped watching" : "started watching"
        } task ${task.title}`,
      }
    );
    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    const isArchived = task.isArchived;

    task.isArchived = !isArchived;
    await task.save();

    await recordActivity(
      req.user._id,
      isArchived ? "unarchived_task" : "archived_task",
      "Task",
      taskId,
      {
        description: `${isArchived ? "unarchived" : "archived"} task ${
          task.title
        }`,
      }
    );

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const { sortBy = "priority" } = req.query;

    let tasks = await Task.find({ assignees: { $in: [req.user._id] } })
      .populate("project", "title workspace")
      .lean();

    // Priority Scoring Algorithm
    const tasksWithScores = tasks.map((task) => {
      let priorityScore = 0;

      // Priority level scoring
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      priorityScore += priorityWeights[task.priority] || 1;

      // Status scoring (To Do gets highest priority, Done gets penalty)
      if (task.status === "To Do") priorityScore += 2;
      if (task.status === "In Progress") priorityScore += 1;
      if (task.status === "Done") priorityScore -= 2; // Penalty for completed tasks

      // Due date urgency scoring
      if (task.dueDate) {
        const daysUntilDue = Math.ceil(
          (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue < 0) priorityScore += 3;
        else if (daysUntilDue <= 2) priorityScore += 2;
      }

      return { ...task, priorityScore };
    });

    // Apply sorting based on query parameter
    let sortedTasks;
    switch (sortBy) {
      case "priority":
        // Priority-based scheduling algorithm
        sortedTasks = tasksWithScores.sort(
          (a, b) => b.priorityScore - a.priorityScore
        );
        break;
      case "dueDate":
        sortedTasks = tasksWithScores.sort(
          (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
        );
        break;
      case "newest":
      default:
        sortedTasks = tasksWithScores.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    res.status(200).json(sortedTasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getArchivedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isArchived: true, assignees: req.user.id })
      .populate("assignees", "name profilePicture")
      .populate("project", "title workspace")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const projectId = project._id;

    const isMember = project.members.some(
      (member) => member.user.toString() === userId.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    project.tasks = project.tasks.filter((task) => task.toString() !== taskId);

    await Comment.deleteMany({ task: taskId });
    await Task.findByIdAndDelete(taskId);
    await project.save();

    await NotificationService.notifyTaskDeleted(
      taskId,
      userId,
      task.title,
      projectId
    );

    await recordActivity(userId, "updated_project", "Project", project._id, {
      description: `deleted task ${task.title}`,
    });

    res.status(200).json({
      message: "Task deleted successfully",
      projectId: projectId.toString(),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTaskDueDate = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const oldDueDate = task.dueDate;
    task.dueDate = dueDate ? new Date(dueDate) : null;
    await task.save();

    await NotificationService.notifyTaskUpdated(taskId, req.user._id, {
      dueDate: task.dueDate,
    });

    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task due date`,
    });

    res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  archiveTask,
  getMyTasks,
  getArchivedTasks,
  addReaction,
  removeReaction,
  deleteTask,
  updateTaskDueDate,
  getCommentReplies,
  deleteComment,
};
