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
import { DataTable } from "./component/data-table"

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
  const [source, setSource] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/users", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load users")
        setUsers(data.users || [])
    console.log("Fetched users:", data.users) // Debug log
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

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
        payload.source = source;
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
      setSource("");
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
              Add User
            </Button>
          </DialogTrigger>
          </div>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">Create User</DialogTitle>
            </DialogHeader>
            <div className="">
              <Card>
                <CardHeader>
                  <CardTitle>Create User</CardTitle>
                  <CardDescription>
                    Only client and employee roles can be created.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto pr-2">
                  <form onSubmit={handleSubmit} className="space-y-5 overflow-hidden overflow-y-auto ">

  {/* GRID 2 COLUMN */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* NAME */}
    <div className="space-y-2">
      <Label>Name</Label>
      <Input
        placeholder="Enter full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </div>

    {/* EMAIL */}
    <div className="space-y-2">
      <Label>Email</Label>
      <Input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    {/* PASSWORD */}
    <div className="space-y-2">
      <Label>Password</Label>
      <Input
        type="password"
        placeholder="Minimum 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    {/* ROLE */}
    <div className="space-y-2">
      <Label>Role</Label>
      <select
        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="client">Client</option>
        <option value="employee">Employee</option>
      </select>
    </div>
  </div>

  {/* ================= CLIENT SECTION ================= */}
  {role === "client" && (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">

      <h3 className="text-sm font-semibold text-muted-foreground">
        Client Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* START DATE */}
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
          />
        </div>

        {/* END DATE */}
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
            required
          />
        </div>

        {/* BUDGET */}
        <div className="space-y-2">
          <Label>Final Budget</Label>
          <Input
            placeholder="₹ Enter budget"
            value={finalBudget}
            onChange={(e) => setFinalBudget(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
  <Label>Phone</Label>
  <Input
    placeholder="Enter phone number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    required
  />
</div>

        {/* PROJECT NAME */}
        <div className="space-y-2">
          <Label>Project Name</Label>
          <Input
            placeholder="Optional"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Source</Label>
          <Input
            placeholder="Referral, Ads, Instagram, Website"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>
      </div>

      {/* DESCRIPTION FULL WIDTH */}
      <div className="space-y-2">
        <Label>Project Description</Label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Describe project..."
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
      </div>
    </div>
  )}

  {/* ================= ALERTS ================= */}
  {message && (
    <div className="text-sm text-green-600 bg-green-100 p-2 rounded">
      {message}
    </div>
  )}

  {error && (
    <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
      {error}
    </div>
  )}

  {/* ================= BUTTON ================= */}
  <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
    {isSubmitting ? "Creating..." : "Create User"}
  </Button>

</form>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
        {/* ========================= USERS TABLE ========================= */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage users, roles, and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-black-200">
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Source</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id || user.id}
                        className="border-b border-cyan-500/10"
                      >
                        <td className="py-2">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2 uppercase">{user.role}</td>
                        {/* <td className="py-2">{user.source}</td> */}
                        <td className="py-2">
                          {user.isActive ? "Active" : "Disabled"}
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
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-gray-400 mt-3">No users found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}