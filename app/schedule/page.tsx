import { Calendar } from "./component/calender"
import { events, eventDates } from "./data"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"


// You can replace these with real user/role data as needed
export default function CalendarPage() {
  const mockUser = { name: "User", email: "user@email.com", avatar: "/logo2.png" };
  const mockRole = "admin";
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar role={mockRole} user={mockUser} />
        <div className="flex flex-col flex-1 min-w-0">
          <SiteHeader title="Schedule" subtitle="Calendar" />
          <main className="flex-1 p-4 lg:p-6 w-290">
            <Calendar events={events} eventDates={eventDates} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// import { CalendarMain } from "./component/calender-unified"

// export default function CalendarPage() {
//   return (
//     <div className="px-4 lg:px-6">
//       <CalendarMain />
//     </div>
//   )
// }