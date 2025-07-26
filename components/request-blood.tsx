"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Droplets, User, Weight, Activity, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RequestBloodProps {
  hospitalData: any
}

export default function RequestBlood({ hospitalData }: RequestBloodProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("")
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [unitsRequired, setUnitsRequired] = useState("")

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const fetchDonors = async (bloodGroup: string) => {
    setLoading(true)
    try {
      let donorsData: any[] = []

      if (bloodGroup === "AB+") {
        const allBloodGroupQueries = bloodGroups.map(async (group) => {
          const q = query(
            collection(db, "donordetails"),
            where("bloodGroup", "==", group),
            where("available", "==", true),
            where("eligible", "==", true),
          )
          const querySnapshot = await getDocs(q)
          return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isUniversalMatch: group !== bloodGroup,
            matchType: group === bloodGroup ? "exact" : group === "O-" ? "universal_donor" : "compatible",
          }))
        })

        const allResults = await Promise.all(allBloodGroupQueries)
        donorsData = allResults.flat()
      } else {
        const exactMatchQuery = query(
          collection(db, "donordetails"),
          where("bloodGroup", "==", bloodGroup),
          where("available", "==", true),
          where("eligible", "==", true),
        )

        const universalDonorQuery = query(
          collection(db, "donordetails"),
          where("bloodGroup", "==", "O-"),
          where("available", "==", true),
          where("eligible", "==", true),
        )

        const [exactMatchSnapshot, universalDonorSnapshot] = await Promise.all([
          getDocs(exactMatchQuery),
          getDocs(universalDonorQuery),
        ])

        const exactMatches = exactMatchSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isUniversalMatch: false,
          matchType: "exact",
        }))

        const universalDonors = universalDonorSnapshot.docs
          .filter((doc) => !exactMatches.some((exact) => exact.id === doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isUniversalMatch: true,
            matchType: "universal_donor",
          }))

        donorsData = [...exactMatches, ...universalDonors]
      }

      donorsData.sort((a, b) => {
        if (a.matchType === "exact" && b.matchType !== "exact") return -1
        if (a.matchType !== "exact" && b.matchType === "exact") return 1
        if (a.matchType === "universal_donor" && b.matchType === "compatible") return -1
        if (a.matchType === "compatible" && b.matchType === "universal_donor") return 1
        return 0
      })

      setDonors(donorsData)
    } catch (error) {
      console.error("Error fetching donors:", error)
      toast({
        title: "Error",
        description: "Failed to fetch donors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBloodGroupSelect = (bloodGroup: string) => {
    setSelectedBloodGroup(bloodGroup)
    fetchDonors(bloodGroup)
    setUnitsRequired("")
  }

  const handleRequestBlood = async () => {
    if (!user || !hospitalData || !selectedBloodGroup || !unitsRequired) return

    setRequesting(true)
    try {
      const requestPromises = donors.map(async (donor) => {
        const requestData = {
          hospitalId: user.uid,
          donorId: donor.id,
          bloodGroup: selectedBloodGroup,
          unitsRequired: Number.parseInt(unitsRequired),
          hospitalName: hospitalData.hospitalName || "Hospital",
          hospitalPhone: hospitalData.phone || "",
          hospitalEmail: user.email || "",
          hospitalCity: hospitalData.city || "",
          hospitalState: hospitalData.state || "",
          hospitalCountry: hospitalData.country || "",
          hospitalPincode: hospitalData.pincode || 0,
          status: "pending",
          createdAt: new Date(),
        }

        await addDoc(collection(db, "requests"), requestData)

        await addDoc(collection(db, "notifications"), {
          donorId: donor.id,
          hospitalId: user.uid,
          type: "blood_request",
          message: `Blood request from ${hospitalData.hospitalName || "Hospital"}`,
          bloodGroup: selectedBloodGroup,
          unitsRequired: Number.parseInt(unitsRequired),
          createdAt: new Date(),
          read: false,
        })
      })

      await Promise.all(requestPromises)
      setUnitsRequired("")

      toast({
        title: "Request Sent Successfully!",
        description: `Blood request sent to ${donors.length} eligible donors.`,
      })
    } catch (error) {
      console.error("Error sending blood request:", error)
      toast({
        title: "Error",
        description: "Failed to send blood request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
    }
  }

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case "exact":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <Droplets className="h-3 w-3 mr-1" />
            Exact Match
          </Badge>
        )
      case "universal_donor":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <User className="h-3 w-3 mr-1" />
            Universal Donor (O-)
          </Badge>
        )
      case "compatible":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Droplets className="h-3 w-3 mr-1" />
            Compatible
          </Badge>
        )
      default:
        return null
    }
  }

  const getCompatibilityInfo = (selectedBloodGroup: string) => {
    if (selectedBloodGroup === "AB+") {
      return {
        title: "Universal Acceptor (AB+)",
        description:
          "AB+ patients can receive blood from all blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) because they have all antigens.",
        icon: "🩸",
      }
    } else {
      return {
        title: "Universal Donor Compatibility",
        description: `${selectedBloodGroup} patients can receive from exact matches and O- donors (universal donors) who can donate to any blood type.`,
        icon: "🔄",
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Request Blood</h2>
        <p className="text-slate-600">Find and request blood from eligible donors</p>
      </div>

      {/* Blood Group and Units Selection (Updated Layout) */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-end gap-4 pt-4">
            {/* Blood Group */}
             <div className="flex flex-col space-y-1 w-full md:w-48">
  <Label htmlFor="bloodGroup" className="text-base font-semibold text-slate-800">
    Blood Group
  </Label>
  <Select value={selectedBloodGroup} onValueChange={handleBloodGroupSelect}>
    <SelectTrigger>
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>
      {bloodGroups.map((group) => (
        <SelectItem key={group} value={group}>
          {group}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="flex flex-col space-y-1 w-full md:w-48">
  <Label htmlFor="units" className="text-base font-semibold text-slate-800">
    Units Required
  </Label>
  <Input
    id="units"
    type="number"
    min="1"
    value={unitsRequired}
    onChange={(e) => setUnitsRequired(e.target.value)}
    placeholder="Enter units"
  />
</div>


            {/* Submit Button */}
            <div className="w-full md:w-auto pt-[22px]">
              <Button
                onClick={handleRequestBlood}
                disabled={requesting || !selectedBloodGroup || !unitsRequired || donors.length === 0}
                className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto"
              >
                {requesting ? "Sending..." : "Request Blood"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility Info */}
      {selectedBloodGroup && (
        <Card className="shadow-sm border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  {getCompatibilityInfo(selectedBloodGroup).icon} {getCompatibilityInfo(selectedBloodGroup).title}
                </h4>
                <p className="text-sm text-blue-800">{getCompatibilityInfo(selectedBloodGroup).description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donor List */}
      {selectedBloodGroup && (
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Available Donors</CardTitle>
            <CardDescription>
              {loading ? "Loading donors..." : `${donors.length} eligible donors found`}
              {donors.length > 0 && (
                <span className="block text-xs text-slate-500 mt-1">
                  Includes exact matches and compatible donors (universal donor/acceptor rules applied)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading eligible donors...</div>
            ) : donors.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No eligible donors found for blood group {selectedBloodGroup}. Only donors who meet all eligibility
                  criteria are shown here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {donors.map((donor) => (
                  <Card key={donor.id} className="border-l-4 border-l-sky-500 bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-sky-600" />
                          <span className="font-semibold text-sky-600">{donor.bloodGroup}</span>
                        </div>
                        {getMatchTypeBadge(donor.matchType)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Age</p>
                            <p className="font-semibold">{donor.age} years</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Weight className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Weight</p>
                            <p className="font-semibold">{donor.weight} kg</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Health Status</p>
                            <Badge variant="secondary" className="capitalize">
                              {donor.healthCondition}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Compatibility</p>
                            <p className="text-xs font-medium text-slate-700">
                              {donor.matchType === "exact"
                                ? "Perfect Match"
                                : donor.matchType === "universal_donor"
                                  ? "Universal Donor"
                                  : "Compatible"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
