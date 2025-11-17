import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import NotificationService from "../services/notification-service.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);
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

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    await NotificationService.notifyProjectCreated(
      newProject._id,
      req.user._id
    );

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

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

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET project by ID
const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId).populate(
    "members.user",
    "name email"
  );
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.status(200).json(project);
};

const updateProjectSettings = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, dueDate, tags } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const oldValues = {
    title: project.title,
    description: project.description,
    status: project.status,
    dueDate: project.dueDate,
    tags: project.tags,
  };

  Object.assign(project, { title, description, status, dueDate, tags });
  await project.save();

  const updatedFields = {};
  Object.keys(oldValues).forEach((key) => {
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(project[key])) {
      updatedFields[key] = {
        old: oldValues[key],
        new: project[key],
      };
    }
  });

  if (Object.keys(updatedFields).length > 0) {
    await NotificationService.notifyProjectUpdated(
      projectId,
      req.user._id,
      updatedFields
    );
  }

  res.status(200).json(project);
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const workspace = await Workspace.findById(project.workspace);
    const workspaceMember = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    const projectMember = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    const canDelete =
      workspaceMember?.role === "owner" ||
      workspaceMember?.role === "admin" ||
      projectMember?.role === "manager";

    if (!canDelete) {
      return res.status(403).json({
        message:
          "You don't have permission to delete this project. Only workspace owners/admins or project managers can delete projects.",
      });
    }

    await NotificationService.notifyProjectDeleted(
      projectId,
      req.user._id,
      project.title,
      project.workspace
    );

    await Project.findByIdAndDelete(projectId);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  getProjectById,
  updateProjectSettings,
  deleteProject,
};
