import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;
    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";
    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filteredTasks =
    myTasks
      ?.filter((task) => {
        switch (filter) {
          case "todo":
            return task.status === "To Do";
          case "inprogress":
            return task.status === "In Progress";
          case "done":
            return task.status === "Done";
          case "archived":
            return task.isArchived;
          case "high":
            return task.priority === "High";
          default:
            return true;
        }
      })
      .filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase())
      ) || [];

  const sortedTasks = [...filteredTasks];

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const doneTasks = sortedTasks.filter((task) => task.status === "Done");

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10">
                <FilterIcon className="w-4 h-4 mr-1" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("archived")}>
                Archived
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Tabs */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tasks assigned to you
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-[1fr_300px] items-start gap-4">
                      {/* LEFT SIDE */}
                      <div className="flex gap-2">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            to={`/workspaces/${task.project?.workspace}/projects/${task.project?._id}/tasks/${task._id}`}
                            className="hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 group break-words"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>

                          <div className="flex items-center space-x-2 mt-1 flex-wrap">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                className={
                                  task.priority === "High"
                                    ? "bg-red-100 text-red-800"
                                    : task.priority === "Medium"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="text-sm text-muted-foreground space-y-1 text-left">
                        {task.dueDate && (
                          <div>Due: {format(task.dueDate, "PPPP")}</div>
                        )}
                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {task.project?.title || "No Project"}
                          </span>
                        </div>
                        <div>Modified on: {format(task.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { status: "To Do", tasks: todoTasks },
              { status: "In Progress", tasks: inProgressTasks },
              { status: "Done", tasks: doneTasks },
            ].map(({ status, tasks }) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {status} <Badge variant="outline">{tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 max-h-[700px] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                      No tasks found
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <Card
                        key={task._id}
                        className="hover:shadow-md transition-shadow p-2"
                      >
                        <Link
                          to={`/workspaces/${task.project?.workspace}/projects/${task.project?._id}/tasks/${task._id}`}
                          className="block"
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {task.description || "No description"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}
                            {task.dueDate && (
                              <span className="text-sm text-muted-foreground">
                                {format(task.dueDate, "PPPP")}
                              </span>
                            )}
                          </div>
                        </Link>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;
