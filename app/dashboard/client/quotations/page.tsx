// "use client";

// import { useEffect, useState } from "react";

// type Quotation = {
//   id: string;
//   name?: string;
//   email?: string;
//   message?: string;
//   amount?: number;
//   createdAt?: string;
// };

// export default function QuotationPage() {
//   const [data, setData] = useState<Quotation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchQuotation = async () => {
     
//     try {
//       const res = await fetch("/api/quotations")
//       const text = await res.text()
//       try {
//         const json = JSON.parse(text)
//         setData(json.quotations || [])
//       } catch {
//         console.error("Not JSON response:", text)
//       }
//     } catch (err) {
//       console.error(err)
//     }
  
//     };

//     fetchQuotation();
//   }, []);

// //   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-500">{error}</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Quotation List</h1>

//       {data.length === 0 ? (
//         <p>No quotations found.</p>
//       ) : (
//         <div className="grid gap-4">
//             <table>
//           <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-black">
//               {data.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="px-5 py-12 text-center text-gray-400 dark:text-gray-600">
//                     <div className="flex flex-col items-center gap-2">
//                       <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
//                         <polyline points="14 2 14 8 20 8"/>
//                         <line x1="9" y1="13" x2="15" y2="13"/>
//                         <line x1="9" y1="17" x2="12" y2="17"/>
//                       </svg>
//                       <span className="text-sm">No quotations yet</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 data.map((q: any, index: number) => (
//                   <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">

//                     {/* Index */}
//                     <td className="px-5 py-4 whitespace-nowrap">
//                       <span className="text-xs font-bold px-2 py-0.5 rounded-md
//                         bg-gray-100 dark:bg-white/10
//                         text-gray-500 dark:text-gray-400">
//                         {index + 1}
//                       </span>
//                     </td>

//                     {/* Title */}
//                     <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
//                       {q.title || "—"}
//                     </td>

//                     {/* Description */}
//                     <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-sm truncate">
//                       {q.description || "—"}
//                     </td>

//                     {/* Document */}
//                     <td className="px-5 py-4 whitespace-nowrap">
//                       {q.fileUrl ? (
//                         <a
//                           href={q.fileUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
//                             border border-gray-200 dark:border-white/10
//                             bg-white dark:bg-white/5
//                             text-gray-700 dark:text-gray-300
//                             hover:border-gray-400 dark:hover:border-white/30
//                             hover:text-gray-900 dark:hover:text-white"
//                         >
//                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
//                             <polyline points="15 3 21 3 21 9"/>
//                             <line x1="10" y1="14" x2="21" y2="3"/>
//                           </svg>
//                           View Doc
//                         </a>
//                       ) : (
//                         <span className="text-xs text-gray-300 dark:text-gray-700 italic">No file</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             </table>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";

type Quotation = {
  id: string;
  name?: string;
  email?: string;
  message?: string;
  amount?: number;
  createdAt?: string;
};

export default function QuotationPage() {
  const [data, setData] = useState<Quotation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await fetch("/api/quotations");
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setData(json.quotations || []);
        } catch {
          console.error("Not JSON response:", text);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuotation();
  }, []);

  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quotation List</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {data.length} quotation{data.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Head */}
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                {["#", "Title", "Description", "Document"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-black">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400 dark:text-gray-600">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="9" y1="13" x2="15" y2="13"/>
                        <line x1="9" y1="17" x2="12" y2="17"/>
                      </svg>
                      <span className="text-sm">No quotations yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((q: any, index: number) => (
                  <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">

                    {/* Index */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {q.title || "—"}
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-sm truncate">
                      {q.description || "—"}
                    </td>

                    {/* Document */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {q.fileUrl ? (
                        <a
                          href={q.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                            border border-gray-200 dark:border-white/10
                            bg-white dark:bg-white/5
                            text-gray-700 dark:text-gray-300
                            hover:border-gray-400 dark:hover:border-white/30
                            hover:text-gray-900 dark:hover:text-white"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          View Doc
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-700 italic">No file</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {data.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 text-xs text-gray-400 dark:text-gray-600">
            Showing {data.length} quotation{data.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}