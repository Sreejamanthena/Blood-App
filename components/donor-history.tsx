"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Building2, MapPin, Phone } from "lucide-react"

export default function DonorHistory() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "requests"), where("donorId", "==", user.uid), where("status", "==", "donated"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setDonations(donationsData.sort((a, b) => b.donatedAt?.toDate() - a.donatedAt?.toDate()))
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  if (loading) {
    return <div>Loading donation history...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Donation History</h2>
        <p className="text-gray-600">Your completed blood donations</p>
      </div>

      {donations.length === 0 ? (
        <Alert>
          <AlertDescription>No donation history yet. Your completed donations will appear here.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {donations.map((donation) => (
            <Card key={donation.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>{donation.hospitalName || "Hospital"}</span>
                </CardTitle>
                <CardDescription>
                  Blood Group: {donation.bloodGroup} • Units: {donation.unitsRequired}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Donated: {new Date(donation.donatedAt?.toDate()).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {donation.hospitalCity}, {donation.hospitalState}, {donation.hospitalCountry} -{" "}
                    {donation.hospitalPincode}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{donation.hospitalPhone}</span>
                </div>

                {donation.hospitalEmail && (
                  <div className="text-sm">
                    <span className="font-medium">Contact: </span>
                    {donation.hospitalEmail}
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
