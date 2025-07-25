"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Phone, MapPin, Calendar, Droplets, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AcceptedDonors() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [donorDetails, setDonorDetails] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "requests"), where("hospitalId", "==", user.uid), where("status", "==", "accepted"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const sortedRequests = requestsData.sort((a, b) => {
        const dateA = a.hospitalAcceptedAt?.toDate() || a.acceptedAt?.toDate() || new Date(0)
        const dateB = b.hospitalAcceptedAt?.toDate() || b.acceptedAt?.toDate() || new Date(0)
        return dateB - dateA
      })

      setAcceptedRequests(sortedRequests)

      const donorDetailsMap: { [key: string]: any } = {}
      for (const request of sortedRequests) {
        try {
          const donorDoc = await getDoc(doc(db, "donordetails", request.donorId))
          if (donorDoc.exists()) {
            donorDetailsMap[request.donorId] = donorDoc.data()
          }
        } catch (error) {
          console.error("Error fetching donor details:", error)
        }
      }
      setDonorDetails(donorDetailsMap)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredRequests(acceptedRequests)
    } else {
      const filtered = acceptedRequests.filter((request) => {
        const donor = donorDetails[request.donorId]
        return donor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      })
      setFilteredRequests(filtered)
    }
  }, [acceptedRequests, donorDetails, searchTerm])

  const handleMarkAsDonated = async (requestId: string, donorId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "donated",
        donatedAt: new Date(),
      })

      await addDoc(collection(db, "notifications"), {
        donorId: donorId,
        hospitalId: user?.uid,
        type: "donation_completed",
        message: "Thank you! Your donation has been completed",
        requestId: requestId,
        createdAt: new Date(),
        read: false,
      })

      toast({
        title: "Success!",
        description: "Donor marked as donated successfully!",
      })
    } catch (error) {
      console.error("Error marking as donated:", error)
      toast({
        title: "Error",
        description: "Failed to mark donor as donated. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading accepted donors...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Accepted Donors</h2>
        <p className="text-slate-600">Donors who have accepted your blood requests</p>
      </div>

      {/* Search */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Search Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-sky-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accepted Donors List */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Accepted Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <Alert className="border-sky-200 bg-sky-50">
              <AlertDescription className="text-sky-700">
                {searchTerm
                  ? "No donors found matching your search."
                  : "No accepted donors yet. Donors will appear here once they accept your requests."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const donor = donorDetails[request.donorId]
                return (
                  <Card key={request.id} className="border-l-4 border-l-emerald-500 bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg text-slate-800">{donor?.name || "Loading..."}</h4>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <Droplets className="h-4 w-4 text-sky-600" />
                              <span className="font-medium text-sky-600">{request.bloodGroup}</span>
                            </div>
                          </div>

                          {donor && (
                            <>
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-slate-500" />
                                <span>{donor.phone}</span>
                              </div>

                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span>
                                  {donor.city}, {donor.state} - {donor.pincode}
                                </span>
                              </div>
                            </>
                          )}

                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span>
                              Accepted:{" "}
                              {new Date(
                                request.hospitalAcceptedAt?.toDate() || request.acceptedAt?.toDate() || new Date(),
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="font-medium">Units Required: </span>
                            {request.unitsRequired}
                          </div>

                          {donor && (
                            <>
                              <div className="text-sm">
                                <span className="font-medium">Age: </span>
                                {donor.age} years
                              </div>

                              <div className="text-sm">
                                <span className="font-medium">Weight: </span>
                                {donor.weight} kg
                              </div>
                            </>
                          )}

                          <div className="pt-2">
                            <Button
                              onClick={() => handleMarkAsDonated(request.id, request.donorId)}
                              className="w-full bg-sky-600 hover:bg-sky-700"
                              size="sm"
                            >
                              Mark as Donated
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
