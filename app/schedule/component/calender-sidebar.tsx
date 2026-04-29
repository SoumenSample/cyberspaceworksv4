"use client"

import { Plus } from "lucide-react"

import { Calendars } from "./calendars"
import { DatePicker } from "./date-picker"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CalendarSidebarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onNewCalendar?: () => void
  onNewEvent?: () => void
  events?: Array<{ date: Date; count: number }>
  className?: string
}

export function CalendarSidebar({ 
  selectedDate,
  onDateSelect,
  onNewCalendar,
  onNewEvent,
  events = [],
  className 
}: CalendarSidebarProps) {
  return (
    <div className={`flex flex-col h-full bg-background text-foreground rounded-lg ${className}`}>
      {/* Add New Event Button */}
      <div className="p-6 border-b bg-background text-foreground">
        <Button 
          className="w-full cursor-pointer text-foreground text-white dark:bg-transparent dark:border-gray-200"
          onClick={onNewEvent}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Event
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        events={events}
      />

      <Separator />

      {/* Calendars */}
      <div className="flex-1 p-4 bg-background text-foreground">
        <Calendars 
          onNewCalendar={onNewCalendar}
          onCalendarToggle={(calendarId, visible) => {
            console.log(`Calendar ${calendarId} visibility: ${visible}`)
          }}
          onCalendarEdit={(calendarId) => {
            console.log(`Edit calendar: ${calendarId}`)
          }}
          onCalendarDelete={(calendarId) => {
            console.log(`Delete calendar: ${calendarId}`)
          }}
        />
      </div>

      {/* Footer */}
      {/* <div className="p-4 border-t bg-background text-foreground">
        <Button 
          variant="outline" 
          className="w-full justify-start text-foreground cursor-pointer"
          onClick={onNewCalendar}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Calendar
        </Button>
      </div> */}
    </div>
  )
}