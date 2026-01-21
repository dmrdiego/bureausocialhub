import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import MainLayout from "./components/layout/MainLayout"
import AuthWrapper from "./components/layout/AuthWrapper"
import { ThemeProvider } from "./components/theme-provider"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import AdminRoute from "@/components/layout/AdminRoute"
import { Toaster } from "@/components/ui/sonner"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy loaded pages for code splitting
const Home = lazy(() => import("./pages/Home"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Docs = lazy(() => import("./pages/Docs"))
const About = lazy(() => import("./pages/About"))
const HousingProject = lazy(() => import("./pages/HousingProject"))
const Traditions = lazy(() => import("./pages/Traditions"))
const Voting = lazy(() => import("./pages/Voting"))
const Events = lazy(() => import("./pages/Events"))
const Profile = lazy(() => import("./pages/Profile"))
const Help = lazy(() => import("./pages/Help"))
const Candidatura = lazy(() => import("./pages/Candidatura"))
const Auth = lazy(() => import("./pages/Auth"))
const Admin = lazy(() => import("./pages/Admin"))
const AssemblyLive = lazy(() => import("./pages/AssemblyLive"))
const Onboarding = lazy(() => import("./pages/Onboarding"))
const CandidaturaDetails = lazy(() => import("./pages/CandidaturaDetails"))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="space-y-6 w-full max-w-2xl">
        <Skeleton className="h-12 w-3/4 rounded-2xl" />
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 pt-8">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthWrapper>
          <Suspense fallback={<PageLoader />}>
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
                  <Route path="candidatura/:id" element={<CandidaturaDetails />} />
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
          </Suspense>
        </AuthWrapper>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
