import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  Calendar,
  CheckSquare,
  Users,
  Rocket,
  ArrowRight,
  Sparkles,
  FolderTreeIcon,
  Star,
  Target,
  Zap,
  MessageCircle,
  BarChart3,
  Clock,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHive - Collaborative Project Management" },
    {
      name: "description",
      content:
        "Welcome to TaskHive! The ultimate collaborative workspace for teams to manage projects, tasks, and deadlines efficiently.",
    },
  ];
}

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FolderTreeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800  from-blue-600 to-purple-600 bg-clip-text">
                TaskHive
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/sign-in">
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-blue-600"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-700 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Team Project Management Made Easy
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Your Projects,
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Perfectly Organized
                  </span>
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                  TaskHive brings your team together—organize projects, track
                  progress, and get things done without the chaos.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-slate-500">Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-slate-500">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600">99%</div>
                  <div className="text-sm text-slate-500">Satisfaction</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link to="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base px-8 py-6 shadow-lg transition-all"
                  >
                    Get Started Here
                    <Rocket className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-slate-200/60 p-5 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FolderTreeIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      TaskHive
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-slate-700 text-sm">
                        Team Members
                      </h3>
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="flex -space-x-2">
                      {[
                        "from-cyan-500 to-blue-500",
                        "from-purple-500 to-pink-500",
                        "from-orange-500 to-red-500",
                        "from-green-500 to-emerald-500",
                      ].map((gradient, index) => (
                        <div
                          key={index}
                          className={`w-7 h-7 bg-gradient-to-r ${gradient} rounded-full border-2 border-white ${index === 3 ? "flex items-center justify-center" : ""}`}
                        >
                          {index === 3 && (
                            <span className="text-white text-xs">+2</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800 text-sm">
                        Active Tasks
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        12
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: "Design Review",
                          due: "Due today • Sarah",
                          priority: true,
                        },
                        {
                          title: "Client Presentation",
                          due: "Tomorrow • Mike",
                          priority: false,
                        },
                      ].map((task, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full border-2 ${task.priority ? "border-blue-500" : "border-slate-300"} flex items-center justify-center`}
                          >
                            {task.priority && (
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-slate-500">{task.due}</p>
                          </div>
                          {task.priority && (
                            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-xs text-orange-600">!</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: Target,
                        color: "green",
                        label: "Completed",
                        value: "24",
                        desc: "This week",
                      },
                      {
                        icon: Clock,
                        color: "blue",
                        label: "In Progress",
                        value: "8",
                        desc: "Active now",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-5 h-5 bg-${item.color}-100 rounded flex items-center justify-center`}
                          >
                            <item.icon
                              className={`w-3 h-3 text-${item.color}-600`}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-base font-bold text-slate-800">
                          {item.value}
                        </p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-white border border-slate-200 rounded-xl p-2 shadow-lg">
                <CheckSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white border border-slate-200 rounded-xl p-2 shadow-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Everything Your Team Needs
            </h2>
            <p className="text-slate-600">
              Powerful features to keep your projects on track and your team in
              sync
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: CheckSquare,
                color: "blue",
                title: "Task Management",
                desc: "Create, assign, and track tasks with deadlines, priorities, and progress tracking.",
              },
              {
                icon: Users,
                color: "purple",
                title: "Team Collaboration",
                desc: "Work together effortlessly with real-time updates, and comments.",
              },
              {
                icon: Rocket,
                color: "green",
                title: "Project Tracking",
                desc: "Monitor project progress with visual boards, timelines, and detailed analytics.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon
                    className={`w-6 h-6 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Join the thousands of teams who have transformed their
              productivity with TaskHive.
            </p>
            <Link to="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-slate-100 text-base px-8 py-4 font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="text-slate-600 text-sm">
              © 2024 TaskHive. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
