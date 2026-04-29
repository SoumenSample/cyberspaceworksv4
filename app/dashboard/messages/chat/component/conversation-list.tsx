"use client"

import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns"
import {
  Search,
  Pin,
  VolumeX,
  MoreHorizontal,
  Users,
  Hash
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useChat, type Conversation } from "../use-chat"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void | Promise<void>
}

// Enhanced time formatting function
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return format(date, 'h:mm a') // 3:30 PM
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE') // Day name
  } else if (isThisYear(date)) {
    return format(date, 'MMM d') // Jan 15
  } else {
    return format(date, 'dd/MM/yy') // 15/01/24
  }
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const { searchQuery, setSearchQuery, togglePin, toggleMute } = useChat()

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedConversations = filteredConversations.sort((a, b) => {
    // Pinned conversations first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Then by last message timestamp
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  })

  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.type === "direct" && conversation.participants.length === 1) {
      // In a real app, you'd check user online status
      return Math.random() > 0.5 // Mock online status
    }
    return false
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white text-black border-r border-black/20 dark:bg-black dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/20 flex-shrink-0">
        <h2 className="text-lg font-semibold text-black dark:text-white">Messages</h2>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-black/20 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60 dark:text-white" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 cursor-text text-black placeholder:text-black/50 border-black/30 dark:text-white dark:border-white"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 border-t border-black/10 bg-white dark:bg-black dark:text-white overflow-y-auto">
        <div className="p-2 pr-3">
          {sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-black/15 cursor-pointer relative group overflow-hidden hover:bg-black/5 transition-colors",
                selectedConversation === conversation.id
                  ? "bg-black/10 text-black border-black/40"
                  : ""
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <Avatar className={cn(
                  "h-12 w-12",
                  selectedConversation === conversation.id && "ring-2 ring-black/30"
                )}>
                  <AvatarImage src={conversation.avatar} alt={conversation.name} />
                  <AvatarFallback className="text-sm text-black bg-black/10">
                    {conversation.type === "group" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Online indicator for direct messages */}
                {conversation.type === "direct" && getOnlineStatus(conversation) && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                )}

                {/* Group indicator */}
                {conversation.type === "group" && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 border-2 border-background rounded-full flex items-center justify-center">
                    <Hash className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-medium truncate min-w-0 max-w-[180px] text-black dark:text-white">{conversation.name}</h3>
                    {conversation.isPinned && (
                      <Pin className="h-3 w-3 text-black/60 flex-shrink-0" />
                    )}
                    {conversation.isMuted && (
                      <VolumeX className="h-3 w-3 text-black/60 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-black/65 flex-shrink-0 ml-2 whitespace-nowrap dark:text-white">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="text-sm text-black/75 truncate flex-1 min-w-0 max-w-[200px] dark:text-white">
                    {conversation.lastMessage.content}
                  </p>

                  {/* Unread count */}
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2 min-w-[20px] h-5 text-xs cursor-pointer flex-shrink-0">
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions menu */}
              <div className="opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin(conversation.id)
                      }}
                      className="cursor-pointer"
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {conversation.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMute(conversation.id)
                      }}
                      className="cursor-pointer"
                    >
                      <VolumeX className="h-4 w-4 mr-2" />
                      {conversation.isMuted ? "Unmute" : "Mute"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                      className="cursor-pointer text-destructive"
                    >
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}