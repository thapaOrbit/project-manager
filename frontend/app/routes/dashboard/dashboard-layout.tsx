import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useParams, useLocation } from "react-router";


const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  
  const { data: workspacesData } = useGetWorkspacesQuery();
  const workspaces: Workspace[] = workspacesData || [];
  const { workspaceId } = useParams();
  const location = useLocation(); 

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspaceFromRoute = workspaces.find(ws => ws._id === workspaceId);
      if (workspaceFromRoute) {
        setCurrentWorkspace(workspaceFromRoute);
      }
    }
  }, [workspaceId, workspaces, location.pathname]);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/sign-in" />;


  const handleWorkspaceSelected = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="h-full mx-auto container px-2 sm:px-6 lg:px-8 py-2 md:py-8 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;