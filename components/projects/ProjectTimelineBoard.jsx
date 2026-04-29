"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const priorityStyles = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

const statusStyles = {
  planning: "bg-slate-500/15 text-slate-200",
  "in-progress": "bg-cyan-500/15 text-black 100",
  "at-risk": "bg-orange-500/15 text-orange-100",
  completed: "bg-emerald-500/15 text-emerald-100",
  paused: "bg-violet-500/15 text-violet-100",
};

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDay(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function addDays(baseDate, days) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getProgressSummary(project) {
  const tasks = project.tasks || [];
  let completed = 0;
  let total = 0;

  for (const task of tasks) {
    total += 1;
    if (task.isDone) completed += 1;

    for (const subtask of task.subtasks || []) {
      total += 1;
      if (subtask.isDone) completed += 1;
    }
  }

  return { completed, total };
}

function buildTimelineRange(project) {
  if (!project) {
    const today = new Date();

    return {
      start: today,
      days: Array.from({ length: 14 }, (_, index) => addDays(today, index)),
    };
  }

  const startDate = toDate(project.startDate || project.createdAt) || new Date();
  const deadline = toDate(project.deadline) || addDays(startDate, 7);
  const span = Math.max(7, Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 4);

  return {
    start: startDate,
    days: Array.from({ length: span }, (_, index) => addDays(startDate, index)),
  };
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDayKey(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDailyDoneMap(project, timelineDays) {
  const doneMap = new Map();
  const validKeys = new Set((timelineDays || []).map((day) => formatDayKey(day)));

  for (const task of project?.tasks || []) {
    if (task?.isDone && task?.doneAt) {
      const doneDate = toDate(task.doneAt);
      if (doneDate) {
        const key = formatDayKey(doneDate);
        if (validKeys.has(key)) {
          const existing = doneMap.get(key) || [];
          existing.push({ type: "task", title: task.title });
          doneMap.set(key, existing);
        }
      }
    }

    for (const subtask of task?.subtasks || []) {
      if (!subtask?.isDone || !subtask?.doneAt) continue;
      const doneDate = toDate(subtask.doneAt);
      if (!doneDate) continue;
      const key = formatDayKey(doneDate);
      if (!validKeys.has(key)) continue;

      const existing = doneMap.get(key) || [];
      existing.push({ type: "subtask", title: subtask.title, parent: task.title });
      doneMap.set(key, existing);
    }
  }

  return doneMap;
}

export default function ProjectTimelineBoard({ role, sessionUserId, canEditTasks = false, project, onProjectUpdated, onRefresh, onEditProject }) {
  const [activeTaskError, setActiveTaskError] = useState("");
  const dayWidth = 144;

  const timeline = useMemo(() => buildTimelineRange(project), [project]);
  const startDate = useMemo(() => (project ? toDate(project.startDate || project.createdAt) || new Date() : null), [project]);
  const deadlineDate = useMemo(() => (project ? toDate(project.deadline) || new Date() : null), [project]);
  const progressSummary = useMemo(() => getProgressSummary(project || {}), [project]);
  const startOffset = useMemo(() => {
    if (!project || !startDate) return 0;

    return clamp(
      Math.round((startDate.getTime() - timeline.start.getTime()) / (1000 * 60 * 60 * 24)),
      0,
      Math.max(timeline.days.length - 1, 0)
    );
  }, [project, startDate, timeline.start, timeline.days.length]);

  const duration = useMemo(() => {
    if (!project || !startDate || !deadlineDate) return timeline.days.length;

    return clamp(
      Math.round((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      1,
      Math.max(timeline.days.length - startOffset, 1)
    );
  }, [project, startDate, deadlineDate, timeline.days.length, startOffset]);

  const todayIndex = useMemo(() => {
    const today = new Date();
    return timeline.days.findIndex((day) => isSameDay(day, today));
  }, [timeline.days]);
  const dailyDoneMap = useMemo(() => buildDailyDoneMap(project, timeline.days), [project, timeline.days]);

  async function toggleItem(projectId, taskId, subtaskId, isDone) {
    try {
      if (!taskId) {
        throw new Error("Task id is missing");
      }

      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: String(taskId),
          ...(subtaskId ? { subtaskId: String(subtaskId) } : {}),
          isDone: Boolean(isDone),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      onProjectUpdated?.(data.project);
      onRefresh?.();
    } catch (toggleError) {
      setActiveTaskError(toggleError.message || "Failed to update task");
    }
  }

  return (
    <div className="space-y-6">
      {/* <Card className="border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,rgba(10,10,18,0.96),rgba(3,7,18,0.92))]">
        <CardHeader>
          <CardTitle className="text-2xl">Progress Timeline</CardTitle>
          <CardDescription>
            A focused horizontal project timeline. Employee task updates are reflected here in real time.
          </CardDescription>
        </CardHeader>
      </Card> */}

      {activeTaskError ? (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{activeTaskError}</p>
      ) : null}

      {!project ? (
        <Card className="bg-background text-foreground dark:bg-black dark:text-white">
          <CardContent className="py-16 text-center text-foreground/70">
            Select a project from the list to view its timeline.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-cyan-400/20 bg-background text-foreground dark:bg-black dark:text-white">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="max-w-2xl text-sm">{project.description || "No description provided."}</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/75">
              <span className={`rounded-full border px-3 py-1 ${priorityStyles[project.priority] || priorityStyles.medium}`}>{project.priority}</span>
              <span className={`rounded-full px-3 py-1 ${statusStyles[project.status] || statusStyles.planning}`}>{project.status}</span>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">{project.assignedEmployees?.length || 0} assigned</span>
              {role === "admin" ? (
                <button
                  type="button"
                  onClick={() => onEditProject?.(project)}
                  className="rounded-full border border-cyan-400/35 px-3 py-1 text-foreground transition-colors hover:bg-cyan-500/20 dark:hover:bg-cyan-900/30"
                >
                  Edit details
                </button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Progress" value={`${project.progress}%`} />
              <Metric label="Tasks done" value={`${progressSummary.completed}/${progressSummary.total || 0}`} />
              <Metric label="Deadline" value={formatLongDate(toDate(project.deadline) || new Date())} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[1200px] space-y-3">
                  <div
                    className="grid gap-2 border-b border-cyan-500/10 pb-3"
                    style={{ gridTemplateColumns: `repeat(${timeline.days.length}, minmax(${dayWidth}px, ${dayWidth}px))` }}
                  >
                    {timeline.days.map((day) => (
                      <div key={day.toISOString()} className="px-2 text-[10px] uppercase tracking-[0.22em] text-black 200/55">
                        <span className="block text-[9px] text-black 100/30">{day.toLocaleDateString("en", { weekday: "short" }).toUpperCase()}</span>
                        {formatDay(day)}
                      </div>
                    ))}
                  </div>

                  <div className="relative grid items-start gap-2" style={{ gridTemplateColumns: `repeat(${timeline.days.length}, minmax(${dayWidth}px, ${dayWidth}px))` }}>
                    {todayIndex >= 0 ? (
                      <div
                        className="pointer-events-none absolute top-0 z-20 h-full w-px bg-rose-400/90 shadow-[0_0_18px_rgba(251,113,133,0.75)]"
                        style={{ left: `calc(${todayIndex} * ${dayWidth}px + ${dayWidth / 2}px)` }}
                      />
                    ) : null}

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[26px] border border-cyan-500/8 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:144px_100%,100%_82px]"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32 }}
                      className="relative z-10 overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[#232834] shadow-[0_0_40px_rgba(6,182,212,0.08)] backdrop-blur"
                      style={{
                        gridColumnStart: startOffset + 1,
                        gridColumnEnd: `span ${duration}`,
                        marginTop: "36px",
                        marginBottom: "36px",
                      }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_35%,rgba(59,130,246,0.07))]" />
                      <div className="relative p-4">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-8 w-1 rounded-full bg-slate-500/80" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="truncate text-[15px] font-semibold leading-tight text-white ">{project.title}</h3>
                            <p className="text-[11px] leading-snug text-white">
                              {formatLongDate(startDate || new Date())} to {formatLongDate(deadlineDate || new Date())}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] uppercase tracking-[0.18em] text-black 100/70">
                              <span className={`rounded-full border px-2.5 py-1 ${priorityStyles[project.priority] || priorityStyles.medium}`}>
                                {project.priority}
                              </span>
                              <span className={`rounded-full px-2.5 py-1 ${statusStyles[project.status] || statusStyles.planning}`}>
                                {project.status}
                              </span>
                              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 text-white px-2.5 py-1">
                                Task done {progressSummary.completed}/{progressSummary.total || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4 rounded-[24px] border border-cyan-500/12 bg-background text-foreground dark:bg-black/25 dark:text-white p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/50">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cyan-950/80">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400" style={{ width: `${project.progress}%` }} />
                  </div>
                  <p className="text-xs text-foreground/55">
                    {role === "client"
                      ? "Project Progress till now."
                      : "Task updates from employees and admins appear here as they check off work."}
                  </p>
                </div>

                {role !== "client" ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-foreground/50">Tasks</div>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {(project.tasks || []).map((task) => (
                        <div key={task._id || task.id || task.title} className="space-y-2 rounded-2xl border border-cyan-500/10 bg-background text-foreground dark:bg-black/25 dark:text-white p-3">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={Boolean(task.isDone)}
                              disabled={!canEditTasks}
                              onChange={(event) => toggleItem(project._id, task._id || task.id, null, event.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-cyan-400/50 bg-background text-foreground dark:bg-black/40 dark:text-white"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">{task.title}</span>
                              {task.description ? <span className="block text-[11px] leading-snug text-foreground/55">{task.description}</span> : null}
                            </span>
                          </label>

                          {!!task.subtasks?.length && (
                            <div className="space-y-2 pl-7">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <label key={subtask._id || subtask.id || `${task._id || task.id}-subtask-${subtaskIndex}`} className="flex items-center gap-3 text-xs text-foreground/75">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(subtask.isDone)}
                                    disabled={!canEditTasks}
                                    onChange={(event) => toggleItem(project._id, task._id || task.id, subtask._id || subtask.id, event.target.checked)}
                                    className="h-4 w-4 rounded border-cyan-400/50 bg-background text-foreground dark:bg-black/40 dark:text-white"
                                  />
                                  <span className="min-w-0 truncate">{subtask.title}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>

              <div className="xl:col-span-2 overflow-x-auto pb-2">
                <div className="min-w-[1200px] space-y-3">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${timeline.days.length}, minmax(${dayWidth}px, ${dayWidth}px))` }}>
                    {timeline.days.map((day) => {
                      const dayKey = formatDayKey(day);
                      const doneItems = dailyDoneMap.get(dayKey) || [];

                      return (
                        <div key={`done-${day.toISOString()}`} className="min-h-[88px] rounded-xl border border-cyan-500/10 bg-background text-foreground dark:bg-black/25 dark:text-white p-2">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/45">Done {formatDay(day)}</p>
                          {doneItems.length ? (
                            <div className="mt-2 space-y-1.5">
                              {doneItems.map((item, index) => (
                                <div key={`${dayKey}-${item.type}-${index}`} className="rounded-lg border border-gray-500/25 px-2 py-1 text-[11px] text-foreground">
                                  {item.type === "subtask" ? `${item.parent}: ${item.title}` : item.title}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] text-foreground/35">No task done</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-background text-foreground dark:bg-black/30 dark:text-white p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
