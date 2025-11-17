import type { ActionType } from "@/types";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Eye,
  EyeOff,
  FileEdit,
  FolderEdit,
  FolderPlus,
  LogIn,
  MessageSquare,
  Upload,
  UserMinus,
  UserPlus,
  Trash2,
  Archive,
  Heart,
  Square, 
  MessageCircle, 
  Download, 
} from "lucide-react";

export const getActivityIcon = (action: ActionType) => {
  switch (action) {
    case "created_task":
      return (
        <div className="bg-green-500/10 p-2 rounded-md">
          <CheckSquare className="h-5 w-5 text-green-500" />
        </div>
      );
    case "created_subtask":
      return (
        <div className="bg-emerald-500/10 p-2 rounded-md">
          <Square className="h-5 w-5 text-emerald-500" /> 
        </div>
      );
    case "updated_task":
      return (
        <div className="bg-blue-500/10 p-2 rounded-md">
          <FileEdit className="h-5 w-5 text-blue-500" />
        </div>
      );
    case "updated_subtask":
      return (
        <div className="bg-indigo-500/10 p-2 rounded-md"> 
          <FileEdit className="h-5 w-5 text-indigo-500" />
        </div>
      );
    case "completed_task":
      return (
        <div className="bg-green-500/10 p-2 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      );
    case "created_project":
      return (
        <div className="bg-blue-500/10 p-2 rounded-md">
          <FolderPlus className="h-5 w-5 text-blue-500" />
        </div>
      );
    case "updated_project":
      return (
        <div className="bg-purple-500/10 p-2 rounded-md">
          <FolderEdit className="h-5 w-5 text-purple-500" />
        </div>
      );
    case "completed_project":
      return (
        <div className="bg-green-500/10 p-2 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      );
    case "created_workspace":
      return (
        <div className="bg-cyan-500/10 p-2 rounded-md"> 
          <Building2 className="h-5 w-5 text-cyan-500" />
        </div>
      );
    case "added_comment":
      return (
        <div className="bg-sky-500/10 p-2 rounded-md">
          <MessageCircle className="h-5 w-5 text-sky-500" /> 
        </div>
      );
    case "deleted_comment":
      return (
        <div className="bg-red-500/10 p-2 rounded-md">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
      );
    case "added_member":
      return (
        <div className="bg-teal-500/10 p-2 rounded-md">
          <UserPlus className="h-5 w-5 text-teal-500" />
        </div>
      );
    case "removed_member":
      return (
        <div className="bg-red-500/10 p-2 rounded-md">
          <UserMinus className="h-5 w-5 text-red-500" />
        </div>
      );
    case "joined_workspace":
      return (
        <div className="bg-lime-500/10 p-2 rounded-md"> 
          <LogIn className="h-5 w-5 text-lime-500" />
        </div>
      );
    case "added_attachment":
      return (
        <div className="bg-orange-500/10 p-2 rounded-md"> 
          <Download className="h-5 w-5 text-orange-500" />
        </div>
      );
    case "watched_task":
      return (
        <div className="bg-violet-500/10 p-2 rounded-md"> 
          <Eye className="h-5 w-5 text-violet-500" />
        </div>
      );
    case "unwatched_task":
      return (
        <div className="bg-gray-500/10 p-2 rounded-md">
          <EyeOff className="h-5 w-5 text-gray-500" />
        </div>
      );
 
    case "archived_task":
      return (
        <div className="bg-amber-500/10 p-2 rounded-md"> 
          <Archive className="h-5 w-5 text-amber-500" />
        </div>
      );
    case "unarchived_task":
      return (
        <div className="bg-emerald-500/10 p-2 rounded-md"> 
          <Archive className="h-5 w-5 text-emerald-500" />
        </div>
      );
   
    case "added_reaction":
      return (
        <div className="bg-pink-500/10 p-2 rounded-md">
          <Heart className="h-5 w-5 text-pink-500" />
        </div>
      );
    case "removed_reaction":
      return (
        <div className="bg-gray-500/10 p-2 rounded-md">
          <Heart className="h-5 w-5 text-gray-500" />
        </div>
      );
    default:
      return null;
  }
};