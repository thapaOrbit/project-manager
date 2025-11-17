import { useAuth } from "@/provider/auth-context";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace, User} from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { useEffect } from "react";
import { useUserProfileQuery } from "@/hooks/use-user";
import { NotificationBell } from "../notifications/notification-bell";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace | null) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user } = useUserProfileQuery() as { data: User | undefined }; 
  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");
  const [searchParams] = useSearchParams();
  const workspaceIdFromUrl = searchParams.get("workspaceId");
  
 
  const { data: workspaces = [] } = useGetWorkspacesQuery();

  // Auto-select workspace from URL on component mount
  useEffect(() => {
    if (workspaceIdFromUrl && workspaces.length > 0) {
      const workspaceFromUrl = workspaces.find(ws => ws._id === workspaceIdFromUrl);
      if (workspaceFromUrl && (!selectedWorkspace || selectedWorkspace._id !== workspaceIdFromUrl)) {
        onWorkspaceSelected(workspaceFromUrl);
      }
    }
  }, [workspaceIdFromUrl, workspaces, selectedWorkspace, onWorkspaceSelected]);

 
  useEffect(() => {
    if (selectedWorkspace && workspaces.length > 0) {
      const workspaceExists = workspaces.some(ws => ws._id === selectedWorkspace._id);
      
      if (!workspaceExists) {
        onWorkspaceSelected(null); 
        
        // Clean up URL parameters if needed
        if (searchParams.get('workspaceId')) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('workspaceId');
          navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
        }
      }
    }
  }, [workspaces, selectedWorkspace, onWorkspaceSelected, navigate, searchParams]);

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);

    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("workspaceId", workspace._id);
      navigate(`${window.location.pathname}?${newSearchParams.toString()}`);
    }
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace.name}</span>
                </>
              ) : (
                <span className="font-medium">Select Workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem key={ws._id} onClick={() => handleOnClick(ws)}>
                  {ws.color && <WorkspaceAvatar color={ws.color} name={ws.name} />}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-4">
        <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded-full border p-1 w-10 h-10">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};