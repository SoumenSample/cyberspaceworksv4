"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ContractForm({ open, setOpen, onSuccess }) {
  const [form, setForm] = useState({
    description: "",
    date: "",
    signature: "",
    reference: "",
     clientEmail: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    await fetch("/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
    console.log(form);

    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>

        <form onSubmit={handleSubmit} className="space-y-4">

          <textarea
            placeholder="Contract description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Signature (type name)"
            className="w-full border p-2 rounded"
            value={form.signature}
            onChange={(e) =>
              setForm({ ...form, signature: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Reference"
            className="w-full border p-2 rounded"
            value={form.reference}
            onChange={(e) =>
              setForm({ ...form, reference: e.target.value })
            }
          />
          <input
  type="email"
  placeholder="Client Email"
  className="w-full border p-2 rounded"
  value={form.clientEmail}
  onChange={(e) =>
    setForm({ ...form, clientEmail: e.target.value })
  }
/>

          <Button type="submit" className="w-full">
            Save Contract
          </Button>

        </form>

      </DialogContent>
    </Dialog>
  )
}