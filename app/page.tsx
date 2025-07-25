"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Building2, Phone, Mail, MapPin, User } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    section?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">BloodConnect</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-red-600"
              >
                About
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-red-600"
              >
                How It Works
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-red-600"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Save Lives Through
            <span className="text-red-600 block">Blood Donation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Connect donors with hospitals seamlessly. Join our community of life-savers and help those in need find the
            blood they require.
          </p>
        </div>

        {/* About Section */}
        <section id="about" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About BloodConnect</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-red-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Donor Dashboard</CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  Join our community of heroes and help save lives by donating blood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div>• Create your donor profile</div>
                  <div>• Get matched with nearby hospitals</div>
                  <div>• Receive donation requests</div>
                  <div>• Track your donation history</div>
                </div>
                <Link href="/auth/donor">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3">Donor</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Hospital Dashboard</CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  Find qualified donors quickly and efficiently for your patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div>• Search for eligible donors</div>
                  <div>• Send donation requests</div>
                  <div>• Filter by blood group & location</div>
                  <div>• Manage blood inventory</div>
                </div>
                <Link href="/auth/hospital">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">Hospital</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Simple steps to save lives through blood donation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600">Sign up as a donor or hospital and complete your profile</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-600">Hospitals request blood and donors receive notifications</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Donate</h3>
              <p className="text-gray-600">Complete the donation and save lives</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Donors</h3>
            <p className="text-gray-600">All donors are verified with health status and eligibility checks</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Hospitals</h3>
            <p className="text-gray-600">Partner with verified hospitals and medical institutions</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Connect</h3>
            <p className="text-gray-600">Real-time notifications and instant communication</p>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-red-600" />
                <span className="text-xl font-bold">BloodConnect</span>
              </div>
              <p className="text-gray-400">Connecting donors with hospitals to save lives through blood donation.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">support@bloodconnect.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">123 Healthcare Ave, Medical City</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency</h3>
              <p className="text-gray-400 mb-2">For urgent blood requirements:</p>
              <p className="text-red-400 font-semibold text-lg">+1 (555) 911-BLOOD</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 BloodConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
