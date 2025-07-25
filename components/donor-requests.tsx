"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Clock, MapPin, Phone, Droplets } from "lucide-react"

interface DonorRequestsProps {
  confirmed?: boolean
}

export default function DonorRequests({ confirmed = false }: DonorRequestsProps) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "requests"),
      where("donorId", "==", user.uid),
      where("status", "==", confirmed ? "accepted" : "pending"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRequests(requestsData)
      setLoading(false)
    })

    return unsubscribe
  }, [user, confirmed])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "accepted",
        acceptedAt: new Date(),
      })

      // Add notification to hospital
      const request = requests.find((r) => r.id === requestId)
      if (request) {
        await addDoc(collection(db, "notifications"), {
          hospitalId: request.hospitalId,
          donorId: user?.uid,
          type: "donor_accepted",
          message: "A donor has accepted your blood request",
          requestId: requestId,
          createdAt: new Date(),
          read: false,
        })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "rejected",
        rejectedAt: new Date(),
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  if (loading) {
    return <div>Loading requests...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{confirmed ? "Confirmed Requests" : "Requests Received"}</h2>
        <p className="text-gray-600">
          {confirmed ? "Requests you have accepted from hospitals" : "Blood donation requests from hospitals"}
        </p>
      </div>

      {requests.length === 0 ? (
        <Alert>
          <AlertDescription>
            {confirmed ? "No confirmed requests yet." : "No pending requests at the moment."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {/* Line 1: Blood Group */}
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-600">{request.bloodGroup}</span>
                  </div>

                  {/* Line 2: Location */}
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {request.hospitalCity}, {request.hospitalState}, {request.hospitalCountry},{" "}
                      {request.hospitalPincode}
                    </span>
                  </div>

                  {/* Line 3: Phone and Date */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{request.hospitalPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{new Date(request.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {!confirmed && (
                  <div className="flex space-x-2 pt-3 border-t mt-3">
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button onClick={() => handleRejectRequest(request.id)} variant="outline" size="sm">
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
