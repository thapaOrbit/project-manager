import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";
import mongoose from "mongoose";
import NotificationService from "../services/notification-service.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById({
      _id: workspaceId,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      members: { $elemMatch: { user: req.user._id } },
    })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({
        workspace: workspaceId,
        isArchived: false,
      }),
      Project.find({
        workspace: workspaceId,
        isArchived: false,
      })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days
    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // populate
    for (const project of projects) {
      for (const task of project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTasks = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTasks.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    const recentProjects = projects
      .filter((project) => !project.isArchived)
      .slice(0, 5);

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await NotificationService.notifyWorkspaceInvitation(
      workspaceId,
      req.user._id,
      [existingUser._id]
    );

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4f46e5;">TaskHive</h1>
        <p style="font-size: 14px; color: #666;">Your project management companion</p>
      </div>
    
      <p>Hello,</p>
      <p>You have been invited to join the workspace <strong>"${
        workspace.name
      }"</strong> on TaskHive!</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">Workspace Details:</p>
        <p style="margin: 5px 0 0 0;">Name: ${workspace.name}</p>
        ${
          workspace.description
            ? `<p style="margin: 5px 0 0 0;">Description: ${workspace.description}</p>`
            : ""
        }
        <p style="margin: 5px 0 0 0;">Role: ${role || "member"}</p>
      </div>
    
      <p>Click the button below to accept the invitation and start collaborating:</p>
    
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Workspace</a>
      </div>
    
      <p style="font-size: 14px; color: #666;">
        This invitation link will expire in <strong>7 days</strong>. If you did not expect to receive this invitation, you can safely ignore this email.
      </p>
    
      <p style="margin-top: 30px; font-size: 12px; color: #999;">
        Need help? Reply to this email and our support team will assist you.
      </p>
    </div>
    `;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await NotificationService.notifyNewMemberJoined(workspaceId, user);

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Check if user is workspace owner or admin
    const canEdit = workspace.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        (member.role === "owner" || member.role === "admin")
    );

    if (!canEdit) {
      return res.status(403).json({
        message:
          "Only workspace owners and admins can update workspace settings",
      });
    }

    const oldValues = {
      name: workspace.name,
      description: workspace.description,
      color: workspace.color,
    };

    workspace.name = name;
    workspace.description = description;
    workspace.color = color;

    await workspace.save();

    const updatedFields = {};
    Object.keys(oldValues).forEach((key) => {
      if (oldValues[key] !== workspace[key]) {
        updatedFields[key] = {
          old: oldValues[key],
          new: workspace[key],
        };
      }
    });

    if (Object.keys(updatedFields).length > 0) {
      await NotificationService.notifyWorkspaceUpdated(
        workspaceId,
        req.user._id,
        updatedFields
      );
    }

    await recordActivity(
      req.user._id,
      "updated_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Updated workspace settings for ${workspace.name}`,
      }
    );

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const transferWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const currentOwner = workspace.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "owner"
    );

    if (!currentOwner) {
      return res.status(403).json({
        message: "Only the current workspace owner can transfer ownership",
      });
    }

    const newOwnerMember = workspace.members.find(
      (member) => member.user.toString() === newOwnerId
    );

    if (!newOwnerMember) {
      return res.status(400).json({
        message: "The new owner must be a member of the workspace",
      });
    }

    // Transfer ownership
    currentOwner.role = "admin"; // Demote current owner to admin
    newOwnerMember.role = "owner"; // Promote new member to owner
    workspace.owner = newOwnerId; // Update workspace owner field

    await workspace.save();

    await NotificationService.notifyWorkspaceOwnershipTransferred(
      workspaceId,
      req.user._id,
      newOwnerId
    );

    await recordActivity(
      req.user._id,
      "transferred_workspace_ownership",
      "Workspace",
      workspaceId,
      {
        description: `Transferred ownership to ${newOwnerId}`,
      }
    );

    res
      .status(200)
      .json({ message: "Workspace ownership transferred successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWorkspace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).session(session);
    if (!workspace) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "owner"
    );

    if (!isOwner) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "Only workspace owners can delete the workspace",
      });
    }

    await NotificationService.notifyWorkspaceDeleted(
      workspaceId,
      req.user._id,
      workspace.name
    );

    // Delete all projects and tasks associated with this workspace
    await Project.deleteMany({ workspace: workspaceId }).session(session);
    await Workspace.findByIdAndDelete(workspaceId).session(session);

    await session.commitTransaction();

    await recordActivity(
      req.user._id,
      "deleted_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Deleted workspace ${workspace.name}`,
      }
    );

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.log("Error deleting workspace:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  updateWorkspace,
  transferWorkspace,
  deleteWorkspace,
};
