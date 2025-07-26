"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Phone, MapPin, Droplets, Clock, CheckCircle, Gift } from "lucide-react"
import ProgressTracker from "./progress-tracker"

export default function RequestedDonors() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedDonor, setSelectedDonor] = useState<any>(null)
  const [donorDetails, setDonorDetails] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "requests"), where("hospitalId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRequests(requestsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()))
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    let filtered = requests
    if (filter === "accepted") {
      filtered = requests.filter((req) => req.status === "accepted")
    } else if (filter === "pending") {
      filtered = requests.filter((req) => req.status === "pending")
    } else if (filter === "donated") {
      filtered = requests.filter((req) => req.status === "donated")
    }
    setFilteredRequests(filtered)
  }, [requests, filter])

  const fetchDonorDetails = async (donorId: string) => {
    try {
      const donorDoc = await getDoc(doc(db, "donordetails", donorId))
      if (donorDoc.exists()) {
        setDonorDetails(donorDoc.data())
      }
    } catch (error) {
      console.error("Error fetching donor details:", error)
    }
  }

  const handleDonorClick = (request: any) => {
    setSelectedDonor(request)
    fetchDonorDetails(request.donorId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "donated":
        return "bg-sky-100 text-sky-800 border-sky-200"
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Updated progress step calculation
  const getProgressStep = (status: string) => {
    switch (status) {
      case "pending":
        return 0 // Step 1 (Request Sent) is always completed, currently on step 1
      case "accepted":
        return 1 // Step 2 (Donor Accepted) is current
      case "donated":
        return 2 // Step 3 (Donation Completed) is current
      case "rejected":
        return 0 // Back to step 1, but with rejected status
      default:
        return 0
    }
  }

  if (loading) {
    return <div>Loading requested donors...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Requested Donors</h2>
        <p className="text-slate-600">Manage your blood donation requests</p>
      </div>

      

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <Alert className="border-sky-200 bg-sky-50">
                <AlertDescription className="text-sky-700">No requests found for the selected filter.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedDonor?.id === request.id
                        ? "border-sky-500 bg-sky-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => handleDonorClick(request)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-5 w-5 text-sky-600" />
                        <span className="font-bold text-lg text-sky-600">
                          {request.donorBloodGroup || request.bloodGroup}
                        </span>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} border font-medium`}>
                        {request.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {request.status === "donated" && <Gift className="h-3 w-3 mr-1" />}
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center space-x-2">
                      <span className="font-medium">{request.unitsRequired} units</span>
                      <span>•</span>
                      <span>{new Date(request.createdAt?.toDate()).toLocaleDateString()}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donor Details */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDonor ? (
              <Alert className="border-slate-200 bg-slate-50">
                <AlertDescription className="text-slate-600">
                  Select a request from the list to view details.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {/* Request Tracking - At Top */}
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-4">Request Status</h4>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <ProgressTracker
                      currentStep={getProgressStep(selectedDonor.status)}
                      steps={["Request Sent", "Donor Accepted", "Donation Completed"]}
                      status={selectedDonor.status}
                    />
                  </div>
                </div>

                {/* Request Info */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-sky-50 to-slate-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-sky-600" />
                    <span className="font-bold text-lg text-sky-600">
                      Donor Blood Group: {selectedDonor.donorBloodGroup || selectedDonor.bloodGroup}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">Requested Blood Group: </span>
                    <span className="font-bold text-sky-600">{selectedDonor.bloodGroup}</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">Units Required: </span>
                    <span className="font-bold">{selectedDonor.unitsRequired}</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">Requested: </span>
                    {new Date(selectedDonor.createdAt?.toDate()).toLocaleString()}
                  </div>
                  {selectedDonor.status === "accepted" && selectedDonor.acceptedAt && (
                    <div className="text-sm text-emerald-700">
                      <span className="font-medium">Accepted: </span>
                      {new Date(selectedDonor.acceptedAt?.toDate()).toLocaleString()}
                    </div>
                  )}
                  {selectedDonor.status === "donated" && selectedDonor.donatedAt && (
                    <div className="text-sm text-emerald-700">
                      <span className="font-medium">Donated: </span>
                      {new Date(selectedDonor.donatedAt?.toDate()).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Donor Details - At Bottom */}
                {donorDetails && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-bold text-slate-800 text-lg">Donor Information</h4>
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                      <div className="font-semibold text-lg text-slate-800">{donorDetails.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{donorDetails.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>
                          {donorDetails.city}, {donorDetails.state} - {donorDetails.pincode}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Age: </span>
                          <span className="font-semibold">{donorDetails.age} years</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Weight: </span>
                          <span className="font-semibold">{donorDetails.weight} kg</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Health Status: </span>
                        <Badge variant="secondary" className="capitalize font-medium">
                          {donorDetails.healthCondition}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
