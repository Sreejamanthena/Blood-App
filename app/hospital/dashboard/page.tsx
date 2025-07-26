"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import HospitalSidebar from "@/components/hospital-sidebar"
import HospitalProfile from "@/components/hospital-profile"
import RequestBlood from "@/components/request-blood"
import RequestedDonors from "@/components/requested-donors"
import AcceptedDonors from "@/components/accepted-donors"
import DonationHistory from "@/components/donation-history"
import LoadingSpinner from "@/components/loading-spinner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Home, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HospitalDashboard() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [hospitalData, setHospitalData] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userRole !== "hospital")) {
      router.push("/auth/hospital")
      return
    }

    if (user) {
      fetchHospitalData()
    }
  }, [user, userRole, loading])

  const fetchHospitalData = async () => {
    if (!user) return

    try {
      // Try to get hospital details from extradetails collection
      const hospitalDoc = await getDoc(doc(db, "extradetails", user.uid))
      if (hospitalDoc.exists()) {
        const data = hospitalDoc.data()
        setHospitalData(data)
      } else {
        // If no extra details, create a basic hospital data object with email
        setHospitalData({
          hospitalName: "Hospital",
          email: user.email,
          phone: "",
          address: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
          description: "",
        })
      }
    } catch (error) {
      console.error("Error fetching hospital data:", error)
      // Set basic data even if there's an error
      setHospitalData({
        hospitalName: "Hospital",
        email: user.email,
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        description: "",
      })
    } finally {
      setPageLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/hospital")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSpinner size="lg" text="Loading hospital dashboard..." />
      </div>
    )
  }

  const HospitalStats = () => {
    const [stats, setStats] = useState({
      totalRequests: 0,
      acceptedRequests: 0,
      pendingRequests: 0,
      completedDonations: 0,
      successRate: 0,
    })

    useEffect(() => {
      if (!user) return

      const q = query(collection(db, "requests"), where("hospitalId", "==", user.uid))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map((doc) => doc.data())
        const totalRequests = requests.length
        const acceptedRequests = requests.filter((r) => r.status === "accepted").length
        const pendingRequests = requests.filter((r) => r.status === "pending").length
        const completedDonations = requests.filter((r) => r.status === "donated").length
        const successRate = totalRequests > 0 ? Math.round((completedDonations / totalRequests) * 100) : 0

        setStats({
          totalRequests,
          acceptedRequests,
          pendingRequests,
          completedDonations,
          successRate,
        })
      })

      return unsubscribe
    }, [user])

    return (
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Hospital Statistics</CardTitle>
          <CardDescription className="text-slate-600">Your blood request performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
  <div className="flex items-center gap-x-6 p-4 rounded-xl border border-slate-200 bg-white">
    <div className="text-slate-700 text-2xl font-bold">
      T
    </div>
    <div>
      <div className="text-base text-slate-600 font-medium">Total Requests</div>
      <div className="text-3xl font-bold text-slate-800">{stats.totalRequests}</div>
    </div>
  </div>

  <div className="flex items-center gap-x-6 p-4 rounded-xl border border-slate-200 bg-white">
    <div className="text-amber-600 text-2xl font-bold">
      ⏳
    </div>
    <div>
      <div className="text-base text-amber-600 font-medium">Pending Requests</div>
      <div className="text-3xl font-bold text-amber-800">{stats.pendingRequests}</div>
    </div>
  </div>

  <div className="flex items-center gap-x-6 p-4 rounded-xl border border-slate-200 bg-white">
    <div className="text-blue-700 text-2xl font-bold">
      💉
    </div>
    <div>
      <div className="text-base text-blue-600 font-medium">Completed Donations</div>
      <div className="text-3xl font-bold text-blue-800">{stats.completedDonations}</div>
    </div>
  </div>

  <div className="flex items-center gap-x-6 p-4 rounded-xl border border-slate-200 bg-white">
    <div className="text-green-700 text-2xl font-bold">
      ✅
    </div>
    <div>
      <div className="text-base text-green-600 font-medium">Success Rate</div>
      <div className="text-3xl font-bold text-green-800">{stats.successRate}%</div>
    </div>
  </div>
</div>
        </CardContent>
      </Card>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HospitalProfile hospitalData={hospitalData} onProfileUpdate={fetchHospitalData} />
            <HospitalStats />
          </div>
        )
      case "request":
        return <RequestBlood hospitalData={hospitalData} />
      case "requested":
        return <RequestedDonors />
      case "accepted":
        return <AcceptedDonors />
      case "history":
        return <DonationHistory />
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HospitalProfile hospitalData={hospitalData} onProfileUpdate={fetchHospitalData} />
            <HospitalStats />
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <HospitalSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-slate-800">Hospital Dashboard</h1>
              {hospitalData && (
                <span className="text-sm text-slate-600 bg-sky-100 px-3 py-1 rounded-full font-medium">
                  {hospitalData.hospitalName}
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
