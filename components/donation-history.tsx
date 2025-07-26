"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Calendar, User, Phone, Droplets } from "lucide-react"

export default function DonationHistory() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "requests"), where("hospitalId", "==", user.uid), where("status", "==", "donated"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const donationsData = []

      for (const docSnapshot of snapshot.docs) {
        const requestData = { id: docSnapshot.id, ...docSnapshot.data() }

        // Fetch donor details
        try {
          const donorDoc = await getDoc(doc(db, "donordetails", requestData.donorId))
          if (donorDoc.exists()) {
            donationsData.push({
              ...requestData,
              donorDetails: donorDoc.data(),
            })
          }
        } catch (error) {
          console.error("Error fetching donor details:", error)
        }
      }

      setDonations(donationsData.sort((a, b) => b.donatedAt?.toDate() - a.donatedAt?.toDate()))
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  if (loading) {
    return <div>Loading donation history...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Donation History</h2>
        <p className="text-gray-600">Completed blood donations at your hospital</p>
      </div>

      {/* Statistics */}
      

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <Alert>
              <AlertDescription>
                No completed donations yet. Donations will appear here once marked as completed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card key={donation.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{donation.donorDetails?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">{donation.bloodGroup}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{donation.donorDetails?.phone}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Units: </span>
                          {donation.unitsRequired}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{new Date(donation.donatedAt?.toDate()).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">Donation Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

