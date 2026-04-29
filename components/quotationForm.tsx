// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"

// export default function QuotationForm({ open, setOpen, onSuccess }) {
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//   })
//   const [file, setFile] = useState(null)

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     const formData = new FormData()
//     formData.append("title", form.title)
//     formData.append("description", form.description)
//     if (file) formData.append("file", file)

//     await fetch("/api/quotations", {
//       method: "POST",
//       body: formData,
//     })

//     setOpen(false)
//     onSuccess()
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent>

//         <form onSubmit={handleSubmit} className="space-y-4">

//           <input
//             type="text"
//             placeholder="Title"
//             className="w-full border p-2 rounded"
//             value={form.title}
//             onChange={(e) =>
//               setForm({ ...form, title: e.target.value })
//             }
//           />

//           <textarea
//             placeholder="Description"
//             className="w-full border p-2 rounded"
//             value={form.description}
//             onChange={(e) =>
//               setForm({ ...form, description: e.target.value })
//             }
//           />

//           <input
//             type="file"
//             onChange={(e) => setFile(e.target.files[0])}
//           />

//           <Button type="submit" className="w-full">
//             Submit
//           </Button>

//         </form>

//       </DialogContent>
//     </Dialog>
//   )
// }








"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function QuotationForm({ open, setOpen, onSuccess }) {
  const [form, setForm] = useState({ title: "", description: "" })
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    formData.append("title", form.title)
    formData.append("description", form.description)
    if (file) formData.append("file", file)

    await fetch("/api/quotations", { method: "POST", body: formData })

    setSubmitting(false)
    setForm({ title: "", description: "" })
    setFile(null)
    setOpen(false)
    onSuccess()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl max-w-md w-full">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              className="text-gray-600 dark:text-gray-300">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">New Quotation</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Fill in the details and attach a document</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Web Design Proposal Q2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all
                bg-gray-50 dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:border-gray-400 dark:focus:border-white/30
                focus:ring-2 focus:ring-gray-100 dark:focus:ring-white/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
              Description
            </label>
            <textarea
              placeholder="Briefly describe the scope, terms, or notes…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none
                bg-gray-50 dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:border-gray-400 dark:focus:border-white/30
                focus:ring-2 focus:ring-gray-100 dark:focus:ring-white/10"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-gray-500 dark:text-gray-400">
              Attachment <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>

            {file ? (
              /* File preview */
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                border border-emerald-200 dark:border-emerald-700/40
                bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    bg-emerald-100 dark:bg-emerald-900/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                      className="text-emerald-600 dark:text-emerald-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 truncate">{file.name}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-colors
                    text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300
                    hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              /* Drop zone */
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg cursor-pointer transition-all
                  border-2 border-dashed
                  ${dragOver
                    ? "border-gray-400 dark:border-white/40 bg-gray-100 dark:bg-white/10"
                    : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-gray-400 dark:text-gray-500">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Drop file here or <span className="text-gray-900 dark:text-white underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">PDF, DOCX, PNG, JPG supported</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-60
                bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              {submitting && (
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {submitting ? "Submitting…" : "Submit Quotation"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-4 rounded-lg text-sm font-semibold transition-colors
                border border-gray-200 dark:border-white/10
                bg-white dark:bg-white/5
                text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}