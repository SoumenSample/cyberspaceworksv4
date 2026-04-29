"use client"


import { useEffect, useMemo, useState } from "react"
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
  // const [isSubmitting, setIsSubmitting] = useState(false)
  // const [message, setMessage] = useState("")

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  // const [error, setError] = useState("")

  // Fetch users from API
const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [stats, setStats] = useState({ totalClients: 0, convertedFromLeads: 0, activeClients: 0 });
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

//   async function loadClients() {
//     try {
//       setLoadingClients(true);
//       const response = await fetch("/api/clients", { cache: "no-store" });
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to load clients");
//       }
//       console.log("Fetched clients:", data.clients);

//       setClients(data.clients || []);

//       // Calculate stats
//       const total = (data.clients || []).length;
//       const converted = (data.clients || []).filter((c) => c.source === "lead-conversion").length;
//       const active = (data.clients || []).filter((c) => c.status === "active").length;

//       setStats({
//         totalClients: total,
//         convertedFromLeads: converted,
//         activeClients: active,
//       });
//     } catch (err) {
//       toast.error(err.message || "Failed to load clients");
//     } finally {
//       setLoadingClients(false);
//     }
//   }

//   useEffect(() => {
//     loadClients();
//   }, []);

//   async function handleSubmit(event: React.FormEvent) {
//     event.preventDefault();
//     if (role === "client" && (!validFrom || !validTo)) {
//       setError("Contract starting and ending dates are required for client users.");
//       return;
//     }
//     if (role === "client" && !finalBudget) {
//       setError("Final budget is required for client users.");
//       return;
//     }
//     if (role === "client") {
//       const fromDate = new Date(validFrom);
//       const toDate = new Date(validTo);
//       if (fromDate >= toDate) {
//         setError("Contract ending date must be after starting date.");
//         return;
//       }
//     }
//     setIsSubmitting(true);
//     setMessage("");
//     setError("");
//     try {
//       const payload: any = {
//         name,
//         email,
//         password,
//         role,
//       };
//       if (role === "client") {
//         payload.finalBudget = finalBudget;
//         payload.projectName = projectName;
//         payload.projectDescription = projectDescription;
//         payload.validFrom = validFrom;
//         payload.validTo = validTo;
//       }
//       const response = await fetch("/api/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || "Failed to create user");
//       }
//       setMessage("User created successfully.");
//       setName("");
//       setEmail("");
//       setPassword("");
//       setRole("client");
//       setFinalBudget("");
//       setProjectName("");
//       setProjectDescription("");
//       setValidFrom("");
//       setValidTo("");
//       setOpen(false);
//       // reload users
//       setUsers(data.users || []);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   const handleDeleteUser = async (id: string | number) => {
//     try {
//       const res = await fetch("/api/users", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: id }),
//       })
//       if (!res.ok) throw new Error("Failed to delete user")
//       // Reload users
//       setUsers(users => users.filter(u => (u._id || u.id) !== id))
//     } catch (err: any) {
//       setError(err.message)
//     }
//   }
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    services: "",
    requirement: "",
    budget: "",
  });

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [convertingLeadId, setConvertingLeadId] = useState(null);
  const [convertDates, setConvertDates] = useState({});
  const [showConvertModal, setShowConvertModal] = useState(null);
  const [convertedCount, setConvertedCount] = useState(0);

  const serviceListPreview = useMemo(() => {
    return formData.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [formData.services]);

  async function loadLeads() {
    try {
      setLoadingLeads(true);
      setError("");

      const response = await fetch("/api/leads", { cache: "no-store" });
      const data = await response.json();
      console.log("Fetched leads:", data.leads);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load leads");
      }

      setLeads(data.leads || []);

      // Calculate converted count
      const converted = (data.leads || []).filter((lead) => lead.convertedToClient).length;
      setConvertedCount(converted);
    } catch (err) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function onFieldChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const services = formData.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (services.length === 0) {
      setError("Please provide at least one service.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          services,
          source: "manual-admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create lead");
      }

      setMessage("Lead added successfully.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        services: "",
        requirement: "",
        budget: "",
      });

      await loadLeads();
    } catch (err) {
      setError(err.message || "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConvertToClient(leadId) {
    const password = convertDates[leadId]?.password;
    const from = convertDates[leadId]?.from;
    const to = convertDates[leadId]?.to;
    const finalBudget = convertDates[leadId]?.finalBudget;
    const projectName = convertDates[leadId]?.projectName || "";
    const projectDescription = convertDates[leadId]?.projectDescription || "";

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!from || !to) {
      setError("Please provide both valid from and valid to dates.");
      return;
    }

    if (!finalBudget || finalBudget.trim().length === 0) {
      setError("Final budget is required.");
      return;
    }

    // Compare dates - to must be after from
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate >= toDate) {
      setError("Valid To date must be after Valid From date.");
      return;
    }

    setConvertingLeadId(leadId);
    setError("");

    try {
      const response = await fetch(`/api/leads/convert/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          validFrom: from,
          validTo: to,
          finalBudget,
          projectName,
          projectDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert lead");
      }

      toast.success("Lead converted to client successfully. Email sent with credentials.");
      setShowConvertModal(null);
      setConvertDates({});

      await loadLeads();
    } catch (err) {
      setError(err.message || "Failed to convert lead");
    } finally {
      setConvertingLeadId(null);
    }
  }

  const handleEditUser = (user: User) => {
    // For now, just log the user to edit
    // In a real app, you'd open an edit dialog
    console.log("Edit user:", user)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
       <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button className="mb-2 right-0" onClick={() => setOpen(true)}>
              Add Leads
            </Button>
          </DialogTrigger>
          </div>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="">
              <DialogTitle className="sr-only">Add Lead</DialogTitle>
            </DialogHeader>
            <div className="">
                      <Card className="">
                        <CardHeader className="">
                          <CardTitle className="">Add Lead</CardTitle>
                        </CardHeader>
              
                        <CardContent className="">
                          <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                              <Label className="">Name</Label>
                              <Input name="name" type="input" className="" value={formData.name} onChange={onFieldChange} required />
                            </div>
              
                            <div>
                              <Label className="">Email</Label>
                              <Input name="email" type="email" value={formData.email} className="" onChange={onFieldChange} required />
                            </div>
              
                            <div>
                              <Label className="">Phone</Label>
                              <Input name="phone" type="phone" value={formData.phone} className="" onChange={onFieldChange} required />
                            </div>
              
                            <div>
                              <Label className="">Services (comma separated)</Label>
                              <Input
                                name="services"
                                type="text"
                                value={formData.services}
                                onChange={onFieldChange}
                                placeholder="Web Development, UI/UX Design"
                                className=""
                                required
                              />
                              {serviceListPreview.length > 0 && (
                                <p className="mt-2 text-xs text-green-400">Selected: {serviceListPreview.join(", ")}</p>
                              )}
                            </div>
              
                            <div>
                              <Label className="">Budget</Label>
                              <Input name="budget" type="text" value={formData.budget} onChange={onFieldChange} placeholder="Optional" className=""/>
                            </div>
              
                            <div>
                              <Label className="">Requirement</Label>
                              <textarea
                                name="requirement"
                                value={formData.requirement}
                                onChange={onFieldChange}
                                rows={4}
                                className="w-full rounded-md border border-gray-400/30 bg-transparent px-3 py-2 text-sm text-gray-500"
                                placeholder="Optional details"
                              />
                            </div>
              
                            {message && <p className="text-sm text-emerald-400">{message}</p>}
                            {error && <p className="text-sm text-red-400">{error}</p>}
              
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? "Saving..." : "Add Lead"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
            </div>
          </DialogContent>
        </Dialog>
       
        {/* ========================= USERS TABLE ========================= */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="">Leads</CardTitle>
            <CardDescription className="">
              Here present all leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {loadingLeads ? (
              <p className="text-gray-400">Loading clients...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-cyan-500/20 text-black dark:text-white">
                      <th className="py-2 pr-2">Name</th>
                      <th className="py-2 pr-2">Contact</th>
                      <th className="py-2 pr-2">Services</th>
                      <th className="py-2 pr-2">Source</th>
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                         {leads.map((lead) => (
                                         <tr key={lead._id} className="border-b border-cyan-500/10 align-top">
                                           <td className="py-2 pr-2">
                                             <p className="break-words whitespace-normal">{lead.name}</p>
                                             <p className="text-xs text-black-100/70">{lead.budget ? `Budget: ${lead.budget}` : "Budget: N/A"}</p>
                                             {lead.convertedToClient && (
                                               <p className="text-xs text-emerald-400 font-semibold">✓ CONVERTED</p>
                                             )}
                                           </td>
                                           <td className="py-2 pr-2">
                                             <p className="break-all whitespace-normal">{lead.email}</p>
                                             <p className="text-xs text-gray-500/70 break-all">{lead.phone}</p>
                                           </td>
                                           <td className="py-2 pr-2">
                                             <p className="break-words whitespace-normal">{(lead.services || []).join(", ") || "N/A"}</p>
                                             {lead.requirement ? (
                                               <p className="mt-1 text-xs text-gray-500/70 break-words whitespace-normal">
                                                 Req: {lead.requirement}
                                               </p>
                                             ) : null}
                                           </td>
                                           <td className="py-2 pr-2 uppercase break-words whitespace-normal">{lead.source}</td>
                                           <td className="py-2 break-words whitespace-normal">{new Date(lead.createdAt).toLocaleString()}</td>
                                           <td className="py-2">
                                             {!lead.convertedToClient ? (
                                               <Button
                                                 size="sm"
                                                 variant="outline"
                                                 onClick={() => setShowConvertModal(lead._id)}
                                                 className="text-xs h-7"
                                               >
                                                 Convert
                                               </Button>
                                             ) : (
                                               <span className="text-xs text-emerald-400">Done</span>
                                             )}
                                           </td>
                                         </tr>
                                       ))}
                  </tbody>
                </table>
                {leads.length === 0 && (
                  <p className="text-gray-400 mt-3">No leads found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
         {showConvertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <CardHeader className="">
                      <CardTitle className="">Convert Lead to Client</CardTitle>
                      <CardDescription className="">Create user account and set project details</CardDescription>
                    </CardHeader>
        
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="">Password (min 8 characters)*</Label>
                        <Input
                          type="password"
                          placeholder="Enter password for client login"
                          value={convertDates[showConvertModal]?.password || ""}
                          className=""
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                password: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
        
                      <div>
                        <Label className="">Contract Valid From*</Label>
                        <Input
                          type="date"
                          className=""
                          value={convertDates[showConvertModal]?.from || ""}
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                from: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
        
                      <div>
                        <Label className="">Contract Valid To*</Label>
                        <Input
                          type="date"
                          className=""
                          value={convertDates[showConvertModal]?.to || ""}
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                to: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
        
                      <div>
                        <Label className="">Final Budget*</Label>
                        <Input
                          placeholder="Enter final budget amount"
                          type=""
                          className=""
                          value={convertDates[showConvertModal]?.finalBudget || ""}
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                finalBudget: e.target.value,
                              },
                            })
                          }
                          required
                        />
                      </div>
        
                      <div>
                        <Label className="">Project Name (optional)</Label>
                        <Input
                          placeholder="Enter project name"
                          type=""
                          className=""
                          value={convertDates[showConvertModal]?.projectName || ""}
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                projectName: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
        
                      <div>
                        <Label className="">Project Description (optional)</Label>
                        <textarea
                          placeholder="Enter project description"
                          value={convertDates[showConvertModal]?.projectDescription || ""}
                          onChange={(e) =>
                            setConvertDates({
                              ...convertDates,
                              [showConvertModal]: {
                                ...convertDates[showConvertModal],
                                projectDescription: e.target.value,
                              },
                            })
                          }
                          rows={3}
                          className="w-full rounded-md border border-gray-400/30 bg-transparent px-3 py-2 text-sm text-gray-500"
                        />
                      </div>
        
                      {error && <p className="text-sm text-red-400">{error}</p>}
        
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowConvertModal(null);
                            setError("");
                          }}
                          disabled={convertingLeadId === showConvertModal}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleConvertToClient(showConvertModal)}
                          disabled={convertingLeadId === showConvertModal}
                        >
                          {convertingLeadId === showConvertModal ? "Converting..." : "Convert & Create"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
      </div>
    </div>
  )
}