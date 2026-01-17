import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import AuthWrapper from "./components/layout/AuthWrapper"
import Docs from "./pages/Docs"
import About from "./pages/About"
import HousingProject from "./pages/HousingProject"
import Traditions from "./pages/Traditions"
import Voting from "./pages/Voting"
import Events from "./pages/Events"
import Profile from "./pages/Profile"
import Help from "./pages/Help"
import Candidatura from "./pages/Candidatura"
import Auth from "./pages/Auth"
import Admin from "./pages/Admin"
import AssemblyLive from "./pages/AssemblyLive"
import Onboarding from "./pages/Onboarding"
import { ThemeProvider } from "./components/theme-provider"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import AdminRoute from "@/components/layout/AdminRoute"

import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="auth" element={<Auth />} />
              <Route path="about" element={<About />} />
              <Route path="project" element={<HousingProject />} />
              <Route path="traditions" element={<Traditions />} />
              <Route path="candidatura" element={<Candidatura />} />

              {/* Portal Area (Dashboard) - Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="docs" element={<Docs />} />
                <Route path="voting" element={<Voting />} />
                <Route path="events" element={<Events />} />
                <Route path="profile" element={<Profile />} />
                <Route path="help" element={<Help />} />
                <Route path="assembleia/live" element={<AssemblyLive />} />
              </Route>

              {/* Admin Area - Admin Role Required */}
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<Admin />} />
              </Route>
            </Route>
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App

