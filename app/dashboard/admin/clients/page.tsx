"use client"


import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatCards } from "./component/stats-card"
// import { DataTable } from "../admin/clients/component/data-table"
import { toast } from "sonner"
import { ArrowUpRight, Badge, Clock5, CreditCard, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react"
import { cn } from '@/lib/utils'
interface User {
  _id?: string
  id?: number
  name: string
  email: string
  avatar?: string
  role: string
  plan?: string
  billing?: string
  status?: string
  joinedDate?: string
  lastLogin?: string
}

interface UserFormValues {
  name: string
  email: string
  role: string
  plan: string
  billing: string
  status: string
}
export default function UsersPage() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("client")
  const [finalBudget, setFinalBudget] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch users from API
const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [stats, setStats] = useState({ totalClients: 0, convertedFromLeads: 0, activeClients: 0 });
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const performanceMetrics = [
    {
      title: "Total Users",
      current: stats.totalClients,
      previous: "-",
      growth: 0,
      icon: Users,
    },
    {
      title: "Converted Users",
      current: stats.convertedFromLeads,
      previous: "-",
      growth: 0,
      icon: CreditCard,
    },
    {
      title: "Active Users",
      current: stats.activeClients,
      previous: "-",
      growth: 0,
      icon: UserCheck,
    },
    {
      title: "Pending Users",
      current: clients.filter((c) => c.status !== "active").length,
      previous: "-",
      growth: 0,
      icon: Clock5,
    },
  ];

  async function loadClients() {
    try {
      setLoadingClients(true);
      const response = await fetch("/api/clients", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load clients");
      }
      console.log("Fetched clients:", data.clients);

      setClients(data.clients || []);

      // Calculate stats
      const total = (data.clients || []).length;
      const converted = (data.clients || []).filter((c) => String(c.source || "").toLowerCase() === "lead-conversion").length;
      const active = (data.clients || []).filter((c) => c.status === "active").length;

      setStats({
        totalClients: total,
        convertedFromLeads: converted,
        activeClients: active,
      });
    } catch (err) {
      toast.error(err.message || "Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (role === "client" && (!validFrom || !validTo)) {
      setError("Contract starting and ending dates are required for client users.");
      return;
    }
    if (role === "client" && !finalBudget) {
      setError("Final budget is required for client users.");
      return;
    }
    if (role === "client") {
      const fromDate = new Date(validFrom);
      const toDate = new Date(validTo);
      if (fromDate >= toDate) {
        setError("Contract ending date must be after starting date.");
        return;
      }
    }
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const payload: any = {
        name,
        email,
        password,
        role,
      };
      if (role === "client") {
        payload.finalBudget = finalBudget;
        payload.projectName = projectName;
        payload.projectDescription = projectDescription;
        payload.validFrom = validFrom;
        payload.validTo = validTo;
      }
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }
      setMessage("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("client");
      setFinalBudget("");
      setProjectName("");
      setProjectDescription("");
      setValidFrom("");
      setValidTo("");
      setOpen(false);
      // reload users
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteUser = async (id: string | number) => {
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      })
      if (!res.ok) throw new Error("Failed to delete user")
      // Reload users
      setUsers(users => users.filter(u => (u._id || u.id) !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEditUser = (user: User) => {
    // For now, just log the user to edit
    // In a real app, you'd open an edit dialog
    console.log("Edit user:", user)
  }

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
         {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {performanceMetrics.map((metric, index) => (
                <Card key={index} className='border'>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <metric.icon className='text-muted-foreground size-6' />
                      <Badge
                        variant='outline'
                        className={cn(
                          metric.growth >= 0
                            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400',
                        )}
                      >
                        {metric.growth >= 0 ? (
                          <>
                            <TrendingUp className='me-1 size-3' />
                            {metric.growth >= 0 ? '+' : ''}
                            {metric.growth}%
                          </>
                        ) : (
                          <>
                            <TrendingDown className='me-1 size-3' />
                            {metric.growth}%
                          </>
                        )}
                      </Badge>
                    </div>
        
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm font-medium'>{metric.title}</p>
                      <div className='text-2xl font-bold'>{metric.current}</div>
                      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                        <span>from {metric.previous}</span>
                        <ArrowUpRight className='size-3' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div> */}
      </div>
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
       
        {/* ========================= USERS TABLE ========================= */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="">Clients</CardTitle>
            <CardDescription className="">
              Here present all clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {loadingClients ? (
              <p className="text-gray-400">Loading clients...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-foreground/80">
                      <th className="py-2">Name</th>
                      <th className="py-2">Contact</th>
                      <th className="py-2">Services</th>
                      <th className="py-2">Budget</th>
                      <th className="py-2">Project</th>
                      <th className="py-2">Validity</th>
                      <th className="py-2">Source</th>
                      <th className="py-2">Requirement</th>
                      <th className="py-2">Created / Converted</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((user) => {
                      const sourceValue = String(user.source || "manual-admin").trim();
                      const isLeadSource = sourceValue.toLowerCase() === "lead-conversion";
                      const isManualSource = sourceValue.toLowerCase() === "manual-admin";
                      const sourceLabel = isLeadSource
                        ? "From Lead"
                        : isManualSource
                          ? "Manual"
                          : sourceValue;
                      return (
                      <tr
                        key={user._id || user.id}
                        className="border-b border-cyan-500/10"
                      >
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">
                          <p className="text-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.phone || "N/A"}</p>
                        </td>
                        <td className="py-2">
                          <p className="text-xs">{(user.services || []).join(", ") || "N/A"}</p>
                        </td>
                        <td className="py-2">
                          <p className="text-xs font-semibold text-foreground">
                            {user.finalBudget || "N/A"}
                          </p>
                          {user.budget ? <p className="text-xs text-muted-foreground">Initial: {user.budget}</p> : null}
                        </td>
                        <td className="py-2">
                          {user.projectName ? (
                            <>
                              <p className="text-xs font-semibold">{user.projectName}</p>
                              {user.projectDescription ? (
                                <p className="text-xs text-muted-foreground">{user.projectDescription.substring(0, 50)}...</p>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-2">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {formatDate(user.validFrom)}
                            <br />to<br />
                            {formatDate(user.validTo)}
                          </p>
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${
                              isLeadSource
                                ? "bg-emerald-500/20 text-emerald-300"
                                : isManualSource
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-slate-500/20 text-slate-200"
                            }`}
                          >
                            {sourceLabel || "Manual"}
                          </span>
                        </td>
                        <td className="py-2">
                          <p className="text-xs text-muted-foreground">
                            {user.requirement ? `${user.requirement.substring(0, 60)}${user.requirement.length > 60 ? "..." : ""}` : "N/A"}
                          </p>
                        </td>
                        <td className="py-2">
                          <p className="text-xs text-muted-foreground">
                            Created: {user.createdBy?.name || user.createdBy?.email || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Converted: {user.convertedBy?.name || user.convertedBy?.email || "N/A"}
                          </p>
                        </td>
                        <td className="py-2">
                          {user.status ? user.status : user.isActive ? "Active" : "Disabled"}
                        </td>
                        <td className="py-2 text-right">
                          {/* prevent deleting admin */}
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(user._id || user.id)}
                              className="text-red-400 hover:text-red-600 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
                {clients.length === 0 && (
                  <p className="text-gray-400 mt-3">No clients found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}