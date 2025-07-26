"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Inbox, CheckCircle, History, Heart, User } from "lucide-react"

interface DonorSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DonorSidebar({ activeTab, setActiveTab }: DonorSidebarProps) {
  const menuItems = [
    {
      id: "profile",
      title: "Profile",
      icon: User,
    },
    {
      id: "requests",
      title: "Requests Received",
      icon: Inbox,
    },
    {
      id: "confirmed",
      title: "Confirmed Requests",
      icon: CheckCircle,
    },
    {
      id: "history",
      title: "Donation History",
      icon: History,
    },
  ]

  return (
    <Sidebar className="border-r-0 shadow-sm">
      <SidebarHeader className="border-b p-6 bg-rose-500">
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
      <Heart className="h-6 w-6 text-white" />
    </div>
    <span className="font-bold text-lg text-white">Donor Portal</span>
  </div>
</SidebarHeader>


      <SidebarContent className="bg-white">
        <SidebarGroup className="px-4 py-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start h-12 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-rose-600 text-white shadow-md"
                        : "hover:bg-slate-100 text-slate-700 hover:text-rose-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
