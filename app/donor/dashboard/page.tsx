"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DonorSidebar from "@/components/donor-sidebar"
import DonorProfile from "@/components/donor-profile"
import DonorRequests from "@/components/donor-requests"
import DonorHistory from "@/components/donor-history"
import LoadingSpinner from "@/components/loading-spinner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Home, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"

export default function DonorDashboard() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [donorData, setDonorData] = useState<any>(null)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userRole !== "donor")) {
      router.push("/auth/donor")
      return
    }

    if (user) {
      fetchDonorData()
    }
  }, [user, userRole, loading])

  const fetchDonorData = async () => {
    if (!user) return

    try {
      const donorDoc = await getDoc(doc(db, "donordetails", user.uid))
      if (donorDoc.exists()) {
        const data = donorDoc.data()
        setDonorData(data)
        setProfileCompleted(true)
      } else {
        setProfileCompleted(false)
      }
    } catch (error) {
      console.error("Error fetching donor data:", error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/donor")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner size="lg" text="Loading donor dashboard..." />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <DonorProfile donorData={donorData} profileCompleted={profileCompleted} onProfileUpdate={fetchDonorData} />
        )
      case "requests":
        return <DonorRequests />
      case "confirmed":
        return <DonorRequests confirmed={true} />
      case "history":
        return <DonorHistory />
      default:
        return (
          <DonorProfile donorData={donorData} profileCompleted={profileCompleted} onProfileUpdate={fetchDonorData} />
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <DonorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-slate-800">Donor Dashboard</h1>
              {donorData && (
                <span className="text-sm text-slate-600 bg-rose-100 px-3 py-1 rounded-full font-medium">
                  {donorData.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 text-slate-600">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-rose-50 hover:text-rose-600 text-slate-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
