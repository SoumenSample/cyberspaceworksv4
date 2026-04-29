"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import ProjectCreatePanel from "@/components/projects/ProjectCreatePanel";
import ProjectTimelineBoard from "@/components/projects/ProjectTimelineBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectManagementWorkspace({ role, sessionUserId, users = [], canEditTasks = false }) {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  async function loadProjects() {
    try {
      setLoadingProjects(true);
      setProjectError("");

      const response = await fetch("/api/projects", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load projects");
      }

      const nextProjects = data.projects || [];
      setProjects(nextProjects);

      setSelectedProjectId((current) => {
        if (current && nextProjects.some((project) => project._id === current)) {
          return current;
        }

        return nextProjects[0]?._id || "";
      });
    } catch (error) {
      setProjectError(error.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [refreshSignal]);

  useEffect(() => {
    if (!sessionUserId) return undefined;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.emit("join", sessionUserId);

    socket.on("project-updated", () => {
      loadProjects();
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionUserId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const projectCounts = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((project) => project.status !== "completed").length;
    const completed = projects.filter((project) => project.status === "completed").length;
    const assignedToMe = projects.filter((project) =>
      (project.assignedEmployees || []).some((employee) => String(employee?._id || employee?.id || employee) === sessionUserId)
    ).length;

    return { total, active, completed, assignedToMe };
  }, [projects, sessionUserId]);

  function handleProjectSaved(project) {
    setProjects((currentProjects) => {
      const index = currentProjects.findIndex((item) => item._id === project._id);

      if (index === -1) {
        return [project, ...currentProjects];
      }

      const nextProjects = [...currentProjects];
      nextProjects[index] = project;
      return nextProjects;
    });

    setSelectedProjectId(project._id);
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditingProject(null);
    setRefreshSignal((value) => value + 1);
  }

  function handleEditProject(project) {
    setEditingProject(project);
    setIsEditOpen(true);
    setIsCreateOpen(false);
  }

  function handleProjectUpdated(project) {
    setProjects((currentProjects) =>
      currentProjects.map((item) => (item._id === project._id ? project : item))
    );
  }

  return (
    //  <div className="">
           
    <div className="space-y-6 bg-background text-foreground">
      {role !== "client" ? (
        <Card className="border-cyan-400/20 bg-background text-foreground dark:bg-black dark:text-white">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-2xl">Manage Projects</CardTitle>
              <CardDescription>
                Select a project to inspect its timeline, task progress, and employee updates.
              </CardDescription>
            </div>

            {role === "admin" ? (
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                Create Project
              </Button>
            ) : null}
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-4">
            <SummaryTile label="Total Projects" value={projectCounts.total} />
            <SummaryTile label="Active" value={projectCounts.active} />
            <SummaryTile label="Completed" value={projectCounts.completed} />
            <SummaryTile label={role === "employee" ? "Assigned to You" : "Assigned to You"} value={projectCounts.assignedToMe} />
          </CardContent>
        </Card>
      ) : null}

      {role === "admin" && isCreateOpen ? (
        <ProjectModal onClose={() => setIsCreateOpen(false)}>
          <ProjectCreatePanel
            users={users}
            onSaved={handleProjectSaved}
            onCancel={() => setIsCreateOpen(false)}
          />
        </ProjectModal>
      ) : null}

      {role === "admin" && isEditOpen && editingProject ? (
        <ProjectModal
          onClose={() => {
            setIsEditOpen(false);
            setEditingProject(null);
          }}
        >
          <ProjectCreatePanel
            users={users}
            initialProject={editingProject}
            mode="edit"
            showTaskOutline={false}
            onSaved={handleProjectSaved}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingProject(null);
            }}
          />
        </ProjectModal>
      ) : null}

      <Card className="border-gray-400/20 bg-background text-foreground dark:bg-black dark:text-white">
        <CardHeader>
          <CardTitle className="text-xl">Projects</CardTitle>
          <CardDescription>Click a project to open its progress timeline.</CardDescription>
        </CardHeader>

        <CardContent>
          {projectError ? <p className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{projectError}</p> : null}

          {loadingProjects ? (
            <p className="text-sm text-cyan-100/70">Loading projects...</p>
          ) : projects.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const isSelected = project._id === selectedProjectId;
                const assignedEmployees = project.assignedEmployees || [];

                return (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => setSelectedProjectId(project._id)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 bg-background text-foreground dark:bg-black dark:text-white${
                      isSelected
                        ? " border-cyan-400/70 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                        : " border-cyan-500/15 hover:border-cyan-400/35 hover:bg-black/45 dark:hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/60">Project</p>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">{project.title}</h3>
                      </div>

                      <span className="rounded-full border border-gray-400/20  px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/80">
                        {project.progress}%
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                      {project.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-foreground/55">
                      <span>{assignedEmployees.length} assigned</span>
                      <span>{project.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-cyan-100/70">No projects yet.</p>
          )}
        </CardContent>
      </Card>

      <ProjectTimelineBoard
        role={role}
        sessionUserId={sessionUserId}
        canEditTasks={canEditTasks}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
        onRefresh={loadProjects}
        onEditProject={handleEditProject}
      />
    </div>
  );
}

function ProjectModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 backdrop-blur-sm">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl">
        {children}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-500/15 bg-background text-foreground dark:bg-black dark:text-white p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-foreground/80">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
