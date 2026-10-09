import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, CarFront, CheckCircle2, ChevronDown,
  CircleHelp, Compass, MapPin, Navigation, Plus, RefreshCw, Search,
  ShieldCheck, SlidersHorizontal, Sparkles, Users, Wallet, X, Zap,
  LogIn, LogOut, User, Play, Layers, Cpu, Database, Network, GitFork,
  Workflow, Code2, Server, FileCode, ArrowRight, ShieldAlert,
  KeyRound, UserPlus, Lock, Mail, Star, ChevronRight, Globe, Check,
  Sun, Moon, Download, TrendingUp, Radio, Sliders, Send, AlertTriangle,
  Award, Gauge, PhoneCall, Route, Shield
} from "lucide-react";

const API = "http://localhost:4000/api";
const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount ?? 0);

// Preset demo accounts
const PRESET_USERS = {
  admin: { id: "U-1", name: "Operations Manager", email: "admin@rideflow.com", role: "admin", avatar: "ADM" },
  riders: [
    { id: "D-101", name: "Arun Kumar", email: "arun@rideflow.com", role: "rider", avatar: "AK", vehicle: "Hyundai Aura", plate: "TN 38 AB 4120", rating: 4.9, earningsToday: 1450, totalTrips: 18 },
    { id: "D-102", name: "Priya S", email: "priya@rideflow.com", role: "rider", avatar: "PS", vehicle: "Maruti Swift", plate: "TN 37 CD 2086", rating: 4.8, earningsToday: 2100, totalTrips: 24 },
    { id: "D-103", name: "Mohammed I", email: "mohammed@rideflow.com", role: "rider", avatar: "MI", vehicle: "Tata Tigor", plate: "TN 66 EF 9031", rating: 4.7, earningsToday: 890, totalTrips: 11 }
  ],
  passengers: [
    { id: "U-101", name: "Ananya Rao", email: "ananya@rideflow.com", role: "user", avatar: "AR" },
    { id: "U-102", name: "Rohan M", email: "rohan@rideflow.com", role: "user", avatar: "RM" },
    { id: "U-103", name: "Meera K", email: "meera@rideflow.com", role: "user", avatar: "MK" }
  ]
};

const PRESET_LOCATIONS = [
  "Peelamedu, Coimbatore",
  "Gandhipuram Bus Stand",
  "PSG Tech Campus",
  "Coimbatore Airport",
  "Brookefields Mall",
  "Race Course Road",
  "Tidel Park Coimbatore",
  "Coimbatore Junction Station"
];

const API_ENDPOINTS_DATA = [
  {
    method: "GET",
    path: "/health",
    title: "System Health Check",
    description: "Returns API service availability, status code, and timestamp.",
    sampleRequest: null,
    sampleResponse: { status: "ok", service: "RideFlow API Engine", timestamp: new Date().toISOString() }
  },
  {
    method: "POST",
    path: "/auth/login",
    title: "User Role Authentication",
    description: "Validates credentials & returns user account profile with permissions.",
    sampleRequest: { email: "admin@rideflow.com", role: "admin" },
    sampleResponse: { message: "Login successful", user: { id: "U-1", name: "Operations Manager", role: "admin" } }
  },
  {
    method: "GET",
    path: "/admin/stats",
    title: "Operations & Revenue Analytics",
    description: "Aggregates live ride counts, revenue, driver fleet availability & completed trips.",
    sampleRequest: null,
    sampleResponse: { totalRides: 6, activeRides: 2, completedRides: 3, totalRevenue: 980 }
  },
  {
    method: "GET",
    path: "/drivers",
    title: "Driver Partner Roster",
    description: "Retrieves list of registered driver partners, ratings, and real-time duty status.",
    sampleRequest: null,
    sampleResponse: { count: 3, drivers: [{ id: "D-101", name: "Arun Kumar", vehicle: "Hyundai Aura", available: true }] }
  },
  {
    method: "PATCH",
    path: "/drivers/D-101/status",
    title: "Driver Duty Status Toggle",
    description: "Updates driver online availability (Available vs Busy / Offline).",
    sampleRequest: { available: true },
    sampleResponse: { message: "Driver availability updated", driver: { id: "D-101", available: true } }
  },
  {
    method: "GET",
    path: "/rides",
    title: "Fetch System Ride Requests",
    description: "Queries all ride requests with optional status or passenger email filters.",
    sampleRequest: null,
    sampleResponse: { count: 3, rides: [{ id: "R-1001", status: "Driver assigned", fare: 245 }] }
  },
  {
    method: "POST",
    path: "/rides",
    title: "Create Ride Request",
    description: "Validates pickup/drop locations, calculates upfront fare, and dispatches driver.",
    sampleRequest: { passengerName: "Ananya Rao", pickup: "Peelamedu", destination: "Airport", carType: "Comfort" },
    sampleResponse: { message: "Ride request created successfully", ride: { id: "R-1004", fare: 245 } }
  },
  {
    method: "PATCH",
    path: "/rides/R-1001/status",
    title: "Ride Lifecycle State Transition",
    description: "Advances ride status through state machine (Assigned ➔ Arrived ➔ In Progress ➔ Completed).",
    sampleRequest: { status: "Completed" },
    sampleResponse: { message: "Ride status updated to Completed", ride: { id: "R-1001", status: "Completed" } }
  },
  {
    method: "POST",
    path: "/users/wallet",
    title: "Digital Wallet Top-Up",
    description: "Executes instant wallet deposit for passenger payment balance.",
    sampleRequest: { email: "ananya@rideflow.com", amount: 500 },
    sampleResponse: { message: "Wallet updated successfully", wallet: 1750 }
  }
];

function Status({ status }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${cls}`}><span className="status-dot" />{status}</span>;
}

function App() {
  // Navigation & UI Context
  const [activeTab, setActiveTab] = useState("home");
  
  // CURRENT USER IS NULL BY DEFAULT UNTIL THEY LOG IN!
  const [currentUser, setCurrentUser] = useState(null);
  
  const [archSubTab, setArchSubTab] = useState("hld");
  const [themeMode, setThemeMode] = useState("light");
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  // Data state
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  
  // UI Controls & Modals
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All rides");
  const [showForm, setShowForm] = useState(false);
  const [showApi, setShowApi] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState("");
  
  // Advanced Driver Partner Features State
  const [driverSafetyChecks, setDriverSafetyChecks] = useState({ fuel: true, clean: true, tires: true });
  const [sosActive, setSosActive] = useState(false);
  const [driverDailyGoal, setDriverDailyGoal] = useState({ targetTrips: 6, bonusAmount: 400 });

  // API Explorer state
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS_DATA[0]);
  const [apiTestResponse, setApiTestResponse] = useState(null);
  const [apiTesting, setApiTesting] = useState(false);
  
  // Manual Auth Form
  const [loginTab, setLoginTab] = useState("login");
  const [manualForm, setManualForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [authError, setAuthError] = useState("");

  // Rider & Passenger Context
  const [selectedDriverId, setSelectedDriverId] = useState("D-101");
  const [selectedPassengerEmail, setSelectedPassengerEmail] = useState("ananya@rideflow.com");
  const [bookingForm, setBookingForm] = useState({
    passengerName: "",
    pickup: "Peelamedu, Coimbatore",
    destination: "Coimbatore Airport",
    carType: "Comfort"
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch backend data
  async function loadData() {
    setLoading(true);
    setApiError("");
    try {
      const [rideRes, driverRes, usersRes] = await Promise.all([
        fetch(`${API}/rides`),
        fetch(`${API}/drivers`),
        fetch(`${API}/users`)
      ]);
      if (!rideRes.ok || !driverRes.ok) throw new Error("API response error");
      
      const rideData = await rideRes.json();
      const driverData = await driverRes.json();
      const usersData = await usersRes.json();

      setRides(rideData.rides);
      setDrivers(driverData.drivers);
      setUsersList(usersData.users || []);
    } catch (error) {
      setApiError("Cannot reach backend API. Make sure node server is running on port 4000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 8000);
    return () => clearInterval(timer);
  }, []);

  async function testApiEndpoint(ep) {
    setApiTesting(true);
    setApiTestResponse(null);
    try {
      let url = `${API}${ep.path.replace("D-101", "D-101").replace("R-1001", "R-1001")}`;
      let options = { method: ep.method, headers: { "Content-Type": "application/json" } };
      
      if (ep.sampleRequest && ep.method !== "GET") {
        options.body = JSON.stringify(ep.sampleRequest);
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = performance.now();

      setApiTestResponse({
        status: res.status,
        statusText: res.statusText || "OK",
        ok: res.ok,
        time: Math.round(endTime - startTime),
        data
      });
    } catch (err) {
      setApiTestResponse({
        status: 500,
        statusText: "Network Error",
        ok: false,
        time: 0,
        data: { error: err.message || "Failed to connect to backend server." }
      });
    } finally {
      setApiTesting(false);
    }
  }

  function exportRidesData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `RideFlow_Rides_Export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToast("Rides data exported successfully as JSON!");
  }

  const switchRole = (role, customUser = null) => {
    setActiveTab(role);
    if (role === "admin") {
      setCurrentUser(customUser || PRESET_USERS.admin);
    } else if (role === "rider") {
      const riderUser = customUser || PRESET_USERS.riders.find(r => r.id === selectedDriverId) || PRESET_USERS.riders[0];
      setCurrentUser(riderUser);
      setSelectedDriverId(riderUser.id);
    } else if (role === "passenger") {
      const passengerUser = customUser || PRESET_USERS.passengers.find(p => p.email === selectedPassengerEmail) || PRESET_USERS.passengers[0];
      setCurrentUser(passengerUser);
      setSelectedPassengerEmail(passengerUser.email);
      setBookingForm(prev => ({ ...prev, passengerName: passengerUser.name }));
    }
    setShowLoginModal(false);
  };

  // Logout Function
  function handleLogout() {
    setCurrentUser(null);
    setToast("Logged out successfully.");
    setActiveTab("home");
  }

  // Handle Manual Login & Registration Submission
  async function handleManualSubmit(e) {
    e.preventDefault();
    setAuthError("");
    if (!manualForm.email || !manualForm.password) {
      setAuthError("Email and Password are required");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manualForm.email, role: manualForm.role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      const loggedInUser = data.user || {
        id: `U-${Date.now()}`,
        name: manualForm.name || manualForm.email.split("@")[0],
        email: manualForm.email,
        role: manualForm.role,
        avatar: (manualForm.name || manualForm.email).substring(0, 2).toUpperCase()
      };

      setCurrentUser(loggedInUser);
      setBookingForm(prev => ({ ...prev, passengerName: loggedInUser.name }));
      setToast(`Welcome back, ${loggedInUser.name}!`);
      setShowLoginModal(false);
      switchRole(loggedInUser.role === 'admin' ? 'admin' : loggedInUser.role === 'rider' ? 'rider' : 'passenger', loggedInUser);
    } catch (err) {
      setAuthError(err.message);
    }
  }

  async function toggleDriverAvailability(driverId, currentStatus) {
    try {
      const res = await fetch(`${API}/drivers/${driverId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update driver status");
      setToast(`Driver status updated to ${!currentStatus ? 'Available' : 'Busy'}.`);
      loadData();
    } catch (err) {
      setToast(err.message);
    }
  }

  async function updateRideStatus(rideId, status, driverId = null) {
    try {
      const res = await fetch(`${API}/rides/${rideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, driverId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setToast(`Ride ${rideId} status changed to "${status}"`);
      loadData();
    } catch (err) {
      setToast(err.message);
    }
  }

  async function handleCreateRide(event) {
    event?.preventDefault();
    if (!currentUser) {
      setShowLoginModal(true);
      setToast("Please log in first to request a ride!");
      return;
    }
    setSubmitting(true);
    setToast("");
    try {
      const response = await fetch(`${API}/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName: bookingForm.passengerName || currentUser.name,
          passengerEmail: currentUser.email || selectedPassengerEmail,
          pickup: bookingForm.pickup,
          destination: bookingForm.destination,
          carType: bookingForm.carType
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create ride request");
      
      setRides((current) => [data.ride, ...current]);
      setShowForm(false);
      setToast(`Ride ${data.ride.id} requested! Searching for nearby driver...`);
      loadData();
    } catch (error) {
      setToast(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTopupWallet(amount) {
    if (!currentUser) {
      setShowLoginModal(true);
      setToast("Please log in to top up your wallet!");
      return;
    }
    try {
      const res = await fetch(`${API}/users/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wallet top up failed");
      setToast(`Added ${money(amount)} to digital wallet!`);
      loadData();
    } catch (err) {
      setToast(err.message);
    }
  }

  const filteredRides = useMemo(() => rides.filter((ride) => {
    const matchesQuery = [ride.id, ride.passengerName, ride.pickup, ride.destination, ride.driverName]
      .join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All rides" || ride.status === filter;
    return matchesQuery && matchesFilter;
  }), [rides, query, filter]);

  const passengerRides = currentUser ? rides.filter(r => (r.passengerEmail || "").toLowerCase() === currentUser.email.toLowerCase() || r.passengerName === currentUser.name) : [];
  const activePassengerRide = passengerRides.find(r => !["Completed", "Cancelled"].includes(r.status));
  const passengerUserDetail = currentUser ? (usersList.find(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase()) || currentUser) : null;

  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const driverAssignedRide = rides.find(r => r.driverId === currentDriver?.id && !["Completed", "Cancelled"].includes(r.status));
  const driverCompletedRides = rides.filter(r => r.driverId === currentDriver?.id && r.status === "Completed");

  const estimatedFare = useMemo(() => {
    const base = bookingForm.carType === "Premium" ? 220 : bookingForm.carType === "Comfort" ? 160 : 110;
    const len = (bookingForm.pickup?.length || 10) + (bookingForm.destination?.length || 10);
    return Math.round((base + len * 3.5) * surgeMultiplier);
  }, [bookingForm, surgeMultiplier]);

  return (
    <div className={`app-shell theme-${themeMode}`}>
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark animate-float-slow"><Compass size={22} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">rideflow<span>.</span></div>
            <div className="brand-sub">NEXTGEN MOBILITY PLATFORM</div>
          </div>
        </div>

        <div className="workspace-label">SYSTEM CONSOLES</div>
        <nav className="nav-list">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Compass size={18} /> Home Overview
            {activeTab === 'home' && <span className="nav-indicator animate-pulse" />}
          </button>

          <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => switchRole('admin')}>
            <ShieldCheck size={18} /> Admin Console
            {activeTab === 'admin' && <span className="nav-indicator animate-pulse" />}
          </button>
          
          <button className={`nav-item ${activeTab === 'rider' ? 'active' : ''}`} onClick={() => switchRole('rider')}>
            <CarFront size={18} /> Driver Partner Console
            {activeTab === 'rider' && <span className="nav-indicator animate-pulse" />}
          </button>
          
          <button className={`nav-item ${activeTab === 'passenger' ? 'active' : ''}`} onClick={() => switchRole('passenger')}>
            <User size={18} /> Passenger App
            {activeTab === 'passenger' && <span className="nav-indicator animate-pulse" />}
          </button>

          <div className="workspace-label" style={{ marginTop: '18px' }}>DESIGN & TOOLS</div>

          <button className={`nav-item ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>
            <Layers size={18} /> HLD & LLD Specs
            {activeTab === 'architecture' && <span className="nav-indicator animate-pulse" />}
          </button>

          <button className="nav-item" onClick={() => { setShowApi(true); setSelectedEndpoint(API_ENDPOINTS_DATA[0]); setApiTestResponse(null); }}>
            <Zap size={18} /> Live API Explorer <span className="tiny-new animate-pulse">TEST</span>
          </button>
        </nav>

        {/* Surge Pricing Toggle Widget */}
        <div className="surge-widget">
          <div className="surge-title">
            <TrendingUp size={14} /> Peak Surge Multiplier
          </div>
          <div className="surge-buttons">
            <button className={surgeMultiplier === 1.0 ? 'active' : ''} onClick={() => setSurgeMultiplier(1.0)}>1.0x Standard</button>
            <button className={surgeMultiplier === 1.5 ? 'active' : ''} onClick={() => setSurgeMultiplier(1.5)}>1.5x Peak</button>
          </div>
        </div>

        {/* Profile Info - ONLY DISPLAYS USER NAME IF LOGGED IN! */}
        <div className="sidebar-bottom">
          <div className="role-badge-box">
            <span className={`role-badge role-${activeTab}`}>
              {activeTab === 'home' ? '🌟 Platform Home' : activeTab === 'admin' ? '🛡️ Admin Mode' : activeTab === 'rider' ? '🚕 Driver Partner' : activeTab === 'passenger' ? '👤 Passenger' : '📐 Architecture'}
            </span>
            <p className="role-desc">
              {activeTab === 'home' && 'System overview & fleet performance metrics'}
              {activeTab === 'admin' && 'Operations control & driver dispatching'}
              {activeTab === 'rider' && 'Trip management & driver earnings'}
              {activeTab === 'passenger' && 'Book rides & track live status'}
              {activeTab === 'architecture' && 'High-Level & Low-Level Design specs'}
            </p>
          </div>

          {currentUser ? (
            <div className="profile" style={{ cursor: 'pointer' }}>
              <div className="avatar">{currentUser.avatar || currentUser.name.substring(0,2).toUpperCase()}</div>
              <div className="profile-info">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.email} ({currentUser.role})</span>
              </div>
              <LogOut size={18} className="muted-icon" title="Logout Account" onClick={handleLogout} />
            </div>
          ) : (
            <div className="profile guest-profile-box" onClick={() => setShowLoginModal(true)} style={{ cursor: 'pointer' }}>
              <div className="avatar guest-avatar">?</div>
              <div className="profile-info">
                <strong>Guest User</strong>
                <span>Click here to Sign In</span>
              </div>
              <LogIn size={18} className="muted-icon" title="Click to Sign In" />
            </div>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main">
        {/* Top bar with theme mode toggle & user status */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>RideFlow Platform</span>
            <span className="crumb-slash">/</span>
            <strong style={{ textTransform: 'capitalize' }}>
              {activeTab === 'home' ? 'Home & System Showcase' : activeTab === 'architecture' ? 'Architecture Explorer (HLD & LLD)' : `${activeTab} Dashboard`}
            </strong>
          </div>
          
          <div className="top-actions">
            <div className="quick-switchers">
              <span className="switch-label">View:</span>
              <button className={`role-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
              <button className={`role-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => switchRole('admin')}>Admin</button>
              <button className={`role-btn ${activeTab === 'rider' ? 'active' : ''}`} onClick={() => switchRole('rider')}>Driver</button>
              <button className={`role-btn ${activeTab === 'passenger' ? 'active' : ''}`} onClick={() => switchRole('passenger')}>Passenger</button>
              <button className={`role-btn ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>HLD/LLD</button>
            </div>

            <button className="icon-button" title="Toggle Light/Dark Theme" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}>
              {themeMode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {currentUser ? (
              <div className="top-user-display" onClick={handleLogout} title="Click to Logout">
                <div className="top-avatar">{currentUser.avatar || currentUser.name.substring(0,2).toUpperCase()}</div>
                <span className="user-name-text">{currentUser.name}</span>
                <LogOut size={15} style={{ marginLeft: '4px' }} />
              </div>
            ) : (
              <button className="primary-button login-top-btn" onClick={() => setShowLoginModal(true)}>
                <LogIn size={15} /> Sign In
              </button>
            )}

            <button className="icon-button" title="Refresh Data" onClick={loadData}>
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {/* Notifications & API Errors */}
          {apiError && (
            <div className="alert alert-error animate-fade-in">
              <CircleHelp size={18} />
              <div><strong>API Connection Error</strong><span>{apiError}</span></div>
            </div>
          )}
          {toast && (
            <div className={`alert ${toast.toLowerCase().includes("error") || toast.toLowerCase().includes("failed") ? "alert-error" : "alert-success"} animate-fade-in`}>
              <CheckCircle2 size={18} />
              <span>{toast}</span>
              <button className="alert-close" onClick={() => setToast("")}><X size={16} /></button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 0. HOME LANDING PAGE VIEW                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'home' && (
            <div className="home-hero-container animate-fade-in-up">
              <section className="hero-banner">
                <div className="hero-content">
                  <div className="hero-badge animate-pulse">
                    <Sparkles size={14} /> NEXT-GEN MOBILITY ECOSYSTEM
                  </div>
                  <h1 className="hero-title">
                    Smart Ride-Hailing Platform <span>Built for Scale.</span>
                  </h1>
                  <p className="hero-subtitle">
                    Experience multi-role coordination with real-time driver dispatching, 
                    upfront fare calculation ({surgeMultiplier}x surge active), live tracking, and interactive HLD/LLD architecture.
                  </p>
                  <div className="hero-cta-group">
                    <button className="primary-button hero-cta" onClick={() => switchRole('passenger')}>
                      <CarFront size={18} /> Book a Ride Now
                    </button>
                    <button className="secondary-button hero-cta-sec" onClick={() => switchRole('admin')}>
                      <ShieldCheck size={18} /> Admin Console
                    </button>
                    <button className="secondary-button hero-cta-sec" onClick={() => switchRole('rider')}>
                      <User size={18} /> Driver Portal
                    </button>
                  </div>
                </div>

                <div className="hero-graphic">
                  <div className="radar-circle circle-1 animate-ping-slow"></div>
                  <div className="radar-circle circle-2 animate-ping-slower"></div>
                  <div className="hero-card float-card card-top">
                    <CarFront size={24} className="hero-card-icon animate-pulse" />
                    <div>
                      <strong>Live Driver GPS Dispatch</strong>
                      <span>Driver D-101 matched in 1.2s</span>
                    </div>
                  </div>
                  <div className="hero-card float-card card-bottom">
                    <CheckCircle2 size={24} color="#10b981" className="animate-pulse" />
                    <div>
                      <strong>Upfront Fare Guarantee</strong>
                      <span>{money(245 * surgeMultiplier)} · Comfort Tier</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Live Driver Radar GPS Widget */}
              <section className="panel radar-widget-panel">
                <div className="panel-heading compact">
                  <div>
                    <div className="panel-kicker">LIVE GPS RADAR SIMULATOR</div>
                    <h2>Fleet Proximity Grid</h2>
                  </div>
                  <span className="count-pill">{drivers.filter(d => d.available).length} drivers available</span>
                </div>
                <div className="radar-grid-container">
                  {drivers.map((d, i) => (
                    <div key={d.id} className={`radar-driver-node ${d.available ? 'online' : 'busy'}`}>
                      <Radio size={16} className="radar-ping-icon animate-pulse" />
                      <div>
                        <strong>{d.name} ({d.id})</strong>
                        <p>{d.vehicle} · {d.plate}</p>
                      </div>
                      <span className="node-status">{d.available ? '🟢 Available' : '🔴 Busy'}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="home-stats-row">
                <div className="home-stat-card">
                  <div className="stat-number">{rides.length}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
                <div className="home-stat-card">
                  <div className="stat-number">{drivers.filter(d => d.available).length}</div>
                  <div className="stat-label">Available Fleet</div>
                </div>
                <div className="home-stat-card">
                  <div className="stat-number">{rides.filter(r => r.status === 'Completed').length}</div>
                  <div className="stat-label">Completed Trips</div>
                </div>
                <div className="home-stat-card">
                  <div className="stat-number">{money(rides.reduce((sum, r) => sum + (r.fare || 0), 0))}</div>
                  <div className="stat-label">Gross Revenue</div>
                </div>
              </section>

              <section className="feature-cards-grid">
                <div className="feature-card" onClick={() => switchRole('admin')}>
                  <div className="feature-card-header admin-theme">
                    <ShieldCheck size={28} />
                    <span>ADMINISTRATOR CONSOLE</span>
                  </div>
                  <h3>Operations & Fleet Dispatch</h3>
                  <p>Monitor active rides, assign drivers, inspect platform revenue, and manage driver status.</p>
                  <div className="feature-link">Open Admin Console <ArrowRight size={15} /></div>
                </div>

                <div className="feature-card" onClick={() => switchRole('rider')}>
                  <div className="feature-card-header rider-theme">
                    <CarFront size={28} />
                    <span>RIDER / DRIVER PORTAL</span>
                  </div>
                  <h3>Driver Partner Suite</h3>
                  <p>Toggle duty status, accept assigned trip requests, track earnings, and execute trip steps.</p>
                  <div className="feature-link">Open Driver Portal <ArrowRight size={15} /></div>
                </div>

                <div className="feature-card" onClick={() => switchRole('passenger')}>
                  <div className="feature-card-header passenger-theme">
                    <User size={28} />
                    <span>PASSENGER APP</span>
                  </div>
                  <h3>Instant Ride Booking</h3>
                  <p>Book rides with location chips, view live fare estimates, track assigned drivers, and top up digital wallet.</p>
                  <div className="feature-link">Open Passenger App <ArrowRight size={15} /></div>
                </div>

                <div className="feature-card" onClick={() => setActiveTab('architecture')}>
                  <div className="feature-card-header arch-theme">
                    <Layers size={28} />
                    <span>SYSTEM DESIGN SPECS</span>
                  </div>
                  <h3>HLD & LLD Blueprint</h3>
                  <p>Inspect high-level microservice topology, database schemas, ERD, finite state machine, and pricing code.</p>
                  <div className="feature-link">View Architecture <ArrowRight size={15} /></div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. ADMIN DASHBOARD VIEW                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'admin' && (
            <div className="animate-fade-in-up">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> MOBILITY OPERATIONS CONSOLE</div>
                  <h1>Admin Operations Center<span>.</span></h1>
                  <p className="subtitle">Real-time system oversight, fleet tracking, and trip dispatches.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="secondary-button" onClick={exportRidesData}>
                    <Download size={16} /> Export Rides (JSON)
                  </button>
                  <button className="primary-button" onClick={() => setShowForm(true)}>
                    <Plus size={17} /> Dispatch Ride Request
                  </button>
                </div>
              </section>

              <section className="metric-grid">
                <Metric label="Active Rides" value={rides.filter(r => !["Completed", "Cancelled"].includes(r.status)).length} note="In progress or searching" icon={<CarFront size={19} />} trend="Live" tone="navy" />
                <Metric label="Available Fleet" value={drivers.filter(d => d.available).length} note={`out of ${drivers.length} drivers online`} icon={<Users size={19} />} trend="Fleet" tone="teal" />
                <Metric label="Completed Rides" value={rides.filter(r => r.status === "Completed").length} note="Total fulfilled rides" icon={<CheckCircle2 size={19} />} trend="Fulfilled" tone="sand" />
                <Metric label="System Revenue" value={money(rides.reduce((sum, r) => sum + (r.fare || 0), 0))} note="Gross booking value" icon={<Wallet size={19} />} trend="Earnings" tone="slate" />
              </section>

              <section className="content-grid">
                <div className="panel rides-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">REAL-TIME MONITORING</div>
                      <h2>All System Ride Requests</h2>
                      <p>View, assign drivers, or update ride statuses across the platform.</p>
                    </div>
                    <button className="secondary-button" onClick={loadData}><RefreshCw size={15} /> Refresh</button>
                  </div>

                  <div className="table-tools">
                    <div className="search-box">
                      <Search size={16} />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rides, passengers, drivers..." />
                    </div>
                    <div className="filter-wrap">
                      <SlidersHorizontal size={15} />
                      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option>All rides</option>
                        <option>Searching for driver</option>
                        <option>Driver assigned</option>
                        <option>Arrived at pickup</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>RIDE / PASSENGER</th>
                          <th>ROUTE & TYPE</th>
                          <th>STATUS</th>
                          <th>ASSIGNED DRIVER</th>
                          <th>FARE</th>
                          <th>ADMIN ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="6" className="empty-state">Loading ride data…</td></tr>
                        ) : filteredRides.length === 0 ? (
                          <tr><td colSpan="6" className="empty-state">No rides match your filter.</td></tr>
                        ) : (
                          filteredRides.map((ride) => (
                            <tr key={ride.id}>
                              <td>
                                <div className="ride-id">{ride.id}</div>
                                <div className="passenger-name">{ride.passengerName}</div>
                              </td>
                              <td>
                                <div className="car-tag">{ride.carType || "Economy"}</div>
                                <div className="route-cell"><span className="route-dot pickup" /><span>{ride.pickup}</span></div>
                                <div className="route-cell destination"><span className="route-dot drop" /><span>{ride.destination}</span></div>
                              </td>
                              <td><Status status={ride.status} /></td>
                              <td>
                                {ride.driverName ? (
                                  <div>
                                    <strong style={{ fontSize: '11px', color: 'var(--dark-slate)' }}>{ride.driverName}</strong>
                                    <div style={{ fontSize: '9px', color: 'var(--slate-600)' }}>{ride.vehicle}</div>
                                  </div>
                                ) : (
                                  <span style={{ fontStyle: 'italic', color: 'var(--slate-400)', fontSize: '10px' }}>Unassigned</span>
                                )}
                              </td>
                              <td className="fare">{money(ride.fare)}</td>
                              <td>
                                <div className="action-buttons-cell">
                                  {!["Completed", "Cancelled"].includes(ride.status) && (
                                    <button 
                                      className="small-action-btn cancel" 
                                      onClick={() => updateRideStatus(ride.id, "Cancelled")}
                                      title="Cancel Ride"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  {ride.status === "Searching for driver" && (
                                    <button 
                                      className="small-action-btn assign"
                                      onClick={() => {
                                        const availableDrv = drivers.find(d => d.available);
                                        if (availableDrv) updateRideStatus(ride.id, "Driver assigned", availableDrv.id);
                                        else setToast("No drivers currently available to assign.");
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-footer">
                    <span>Showing <strong>{filteredRides.length}</strong> of <strong>{rides.length}</strong> total rides</span>
                    <span className="updated"><span /> Live API synchronisation active</span>
                  </div>
                </div>

                <div className="right-column">
                  <section className="panel drivers-panel">
                    <div className="panel-heading compact">
                      <div>
                        <div className="panel-kicker">ON-CALL FLEET</div>
                        <h2>Driver Roster</h2>
                      </div>
                      <span className="count-pill">{drivers.length} drivers</span>
                    </div>

                    <div className="driver-list">
                      {drivers.map((driver, index) => (
                        <div className="driver-item" key={driver.id}>
                          <div className={`driver-avatar driver-${index}`}>
                            {driver.avatar || driver.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="driver-details">
                            <strong>{driver.name}</strong>
                            <span>{driver.vehicle} · {driver.plate}</span>
                            <div className="driver-meta">
                              <span className="rating">★ {driver.rating}</span>
                              <span>·</span>
                              <span>Earned: {money(driver.earnings || 0)}</span>
                            </div>
                          </div>
                          <button 
                            className={`availability-toggle ${driver.available ? "online" : "offline"}`}
                            onClick={() => toggleDriverAvailability(driver.id, driver.available)}
                            title="Click to toggle availability"
                          >
                            {driver.available ? "Online" : "Busy"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. ENHANCED DRIVER / RIDER PARTNER PORTAL                                 */}
          {/* ========================================================================= */}
          {activeTab === 'rider' && (
            <div className="animate-fade-in-up driver-portal-wrapper">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> DRIVER PARTNER CONSOLE</div>
                  <h1>Welcome back, {currentDriver?.name}<span>!</span></h1>
                  <p className="subtitle">Manage trip dispatches, execute turn-by-turn steps, track earnings & target goals.</p>
                </div>

                <div className="driver-select-container">
                  <span className="select-label">Active Driver Profile:</span>
                  <select 
                    className="driver-select-dropdown"
                    value={selectedDriverId}
                    onChange={(e) => {
                      setSelectedDriverId(e.target.value);
                      const drv = PRESET_USERS.riders.find(r => r.id === e.target.value);
                      if (drv) setCurrentUser(drv);
                    }}
                  >
                    {PRESET_USERS.riders.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.vehicle})</option>
                    ))}
                  </select>
                </div>
              </section>

              {/* Driver Metrics Bar */}
              <section className="metric-grid">
                <Metric label="Duty Status" value={currentDriver?.available ? "ONLINE" : "BUSY"} note="Toggle availability below" icon={<CarFront size={19} />} trend="Duty" tone={currentDriver?.available ? "teal" : "sand"} />
                <Metric label="Daily Earnings" value={money((currentDriver?.earnings || 0) + (driverCompletedRides.length * 240))} note="Fares + incentives" icon={<Wallet size={19} />} trend="Accumulated" tone="navy" />
                <Metric label="Completed Trips" value={driverCompletedRides.length} note="Fulfilled today" icon={<CheckCircle2 size={19} />} trend="Fulfilled" tone="slate" />
                <Metric label="Partner Rating" value={`★ ${currentDriver?.rating || 4.9}`} note="Based on rider feedback" icon={<Sparkles size={19} />} trend="Rating" tone="sand" />
              </section>

              {/* Advanced Driver Tools Bar */}
              <section className="driver-tools-bar">
                <button 
                  className={`sos-btn ${sosActive ? 'active' : ''}`}
                  onClick={() => {
                    setSosActive(!sosActive);
                    setToast(!sosActive ? "🚨 EMERGENCY SOS BROADCASTED TO DISPATCH CENTER!" : "Emergency alert deactivated.");
                  }}
                >
                  <AlertTriangle size={16} /> {sosActive ? "🚨 EMERGENCY SOS ACTIVE" : "TRIGGER EMERGENCY SOS"}
                </button>

                <div className="safety-checklist-box">
                  <span className="checklist-label"><Shield size={14} /> Safety Check:</span>
                  <button className={`chip-btn ${driverSafetyChecks.fuel ? 'active' : ''}`} onClick={() => setDriverSafetyChecks({ ...driverSafetyChecks, fuel: !driverSafetyChecks.fuel })}>
                    <Check size={12} /> Fuel/Battery
                  </button>
                  <button className={`chip-btn ${driverSafetyChecks.clean ? 'active' : ''}`} onClick={() => setDriverSafetyChecks({ ...driverSafetyChecks, clean: !driverSafetyChecks.clean })}>
                    <Check size={12} /> Vehicle Clean
                  </button>
                  <button className={`chip-btn ${driverSafetyChecks.tires ? 'active' : ''}`} onClick={() => setDriverSafetyChecks({ ...driverSafetyChecks, tires: !driverSafetyChecks.tires })}>
                    <Check size={12} /> Tire Pressure
                  </button>
                </div>

                <div className="daily-goal-box">
                  <div className="goal-title"><Award size={14} /> Daily Goal: {driverCompletedRides.length} / {driverDailyGoal.targetTrips} Trips</div>
                  <div className="goal-progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (driverCompletedRides.length / driverDailyGoal.targetTrips) * 100)}%` }}></div>
                  </div>
                  <span className="goal-reward">+₹{driverDailyGoal.bonusAmount} Bonus</span>
                </div>
              </section>

              {/* Main Active Trip Dispatch & History Grid */}
              <section className="driver-main-grid">
                <div className="panel driver-active-card">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">LIVE TRIP DISPATCH ENGINE</div>
                      <h2>Assigned Ride Controls</h2>
                    </div>
                    <button 
                      className={`primary-button ${currentDriver?.available ? "online-btn" : "busy-btn"}`}
                      onClick={() => toggleDriverAvailability(currentDriver.id, currentDriver.available)}
                    >
                      {currentDriver?.available ? "Go Offline / Set Busy" : "Go Online (Available)"}
                    </button>
                  </div>

                  <div className="active-ride-body">
                    {driverAssignedRide ? (
                      <div className="trip-dispatch-box">
                        <div className="trip-header">
                          <span className="trip-badge">TRIP #{driverAssignedRide.id}</span>
                          <Status status={driverAssignedRide.status} />
                        </div>

                        <div className="route-nav-preview">
                          <div className="nav-step-chip">
                            <Route size={14} /> Route ETA: 8 mins · Traffic: Normal
                          </div>
                        </div>

                        <div className="trip-locations">
                          <div className="loc-item">
                            <MapPin size={18} className="pickup-icon" />
                            <div>
                              <span className="loc-title">PICKUP PASSENGER</span>
                              <strong>{driverAssignedRide.pickup}</strong>
                              <p>Passenger: {driverAssignedRide.passengerName}</p>
                            </div>
                          </div>

                          <div className="loc-item">
                            <Navigation size={18} className="drop-icon" />
                            <div>
                              <span className="loc-title">DROP DESTINATION</span>
                              <strong>{driverAssignedRide.destination}</strong>
                              <p>Class: {driverAssignedRide.carType || "Economy"} · Fare Collection: {money(driverAssignedRide.fare)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="driver-action-bar">
                          {driverAssignedRide.status === "Driver assigned" && (
                            <button 
                              className="driver-action-btn arrived"
                              onClick={() => updateRideStatus(driverAssignedRide.id, "Arrived at pickup")}
                            >
                              <MapPin size={16} /> Mark Arrived at Pickup
                            </button>
                          )}

                          {driverAssignedRide.status === "Arrived at pickup" && (
                            <button 
                              className="driver-action-btn start"
                              onClick={() => updateRideStatus(driverAssignedRide.id, "In Progress")}
                            >
                              <Play size={16} /> Start Trip (In Progress)
                            </button>
                          )}

                          {driverAssignedRide.status === "In Progress" && (
                            <button 
                              className="driver-action-btn complete"
                              onClick={() => updateRideStatus(driverAssignedRide.id, "Completed")}
                            >
                              <CheckCircle2 size={16} /> Complete Trip & Collect {money(driverAssignedRide.fare)}
                            </button>
                          )}

                          <button 
                            className="secondary-button"
                            onClick={() => updateRideStatus(driverAssignedRide.id, "Cancelled")}
                          >
                            Decline / Cancel Trip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="no-trip-placeholder">
                        <CarFront size={48} className="placeholder-icon animate-pulse" />
                        <h3>No Active Trip Assigned</h3>
                        <p>Stay online! When a passenger or admin creates a ride request, it will dispatch right here automatically.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel driver-history-card">
                  <div className="panel-heading compact">
                    <div>
                      <div className="panel-kicker">DRIVER REVENUE LOG</div>
                      <h2>Trip Earnings History</h2>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>TRIP ID</th>
                          <th>PASSENGER</th>
                          <th>ROUTE</th>
                          <th>NET FARE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverCompletedRides.length === 0 ? (
                          <tr><td colSpan="4" className="empty-state">No completed rides recorded yet.</td></tr>
                        ) : (
                          driverCompletedRides.map(r => (
                            <tr key={r.id}>
                              <td><strong>{r.id}</strong></td>
                              <td>{r.passengerName}</td>
                              <td>{r.pickup} → {r.destination}</td>
                              <td className="fare">{money(r.fare)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. PASSENGER / USER DASHBOARD VIEW                                        */}
          {/* ========================================================================= */}
          {activeTab === 'passenger' && (
            <div className="animate-fade-in-up">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> PASSENGER MOBILITY APP</div>
                  <h1>Where to next{currentUser ? `, ${passengerUserDetail.name}` : ''}<span>?</span></h1>
                  <p className="subtitle">Request an instant ride, track your assigned driver, or manage your digital wallet.</p>
                </div>

                {currentUser ? (
                  <div className="driver-select-container">
                    <span className="select-label">Logged Passenger:</span>
                    <select 
                      className="driver-select-dropdown"
                      value={selectedPassengerEmail}
                      onChange={(e) => {
                        setSelectedPassengerEmail(e.target.value);
                        const u = PRESET_USERS.passengers.find(p => p.email === e.target.value);
                        if (u) {
                          setCurrentUser(u);
                          setBookingForm(prev => ({ ...prev, passengerName: u.name }));
                        }
                      }}
                    >
                      {PRESET_USERS.passengers.map(p => (
                        <option key={p.id} value={p.email}>{p.name} ({p.email})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button className="primary-button" onClick={() => setShowLoginModal(true)}>
                    <LogIn size={16} /> Sign In to Access Passenger Account
                  </button>
                )}
              </section>

              <section className="passenger-grid">
                <div className="panel book-ride-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">INSTANT BOOKING</div>
                      <h2>Book a Ride</h2>
                      <p>Select pickup & destination for guaranteed upfront pricing.</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateRide} className="booking-form-content">
                    <div className="form-group">
                      <label><User size={15} /> Passenger Name</label>
                      <input 
                        required
                        value={bookingForm.passengerName}
                        onChange={(e) => setBookingForm({ ...bookingForm, passengerName: e.target.value })}
                        placeholder="Enter passenger name"
                      />
                    </div>

                    <div className="form-group">
                      <label><MapPin size={15} /> Pickup Location</label>
                      <input 
                        required
                        value={bookingForm.pickup}
                        onChange={(e) => setBookingForm({ ...bookingForm, pickup: e.target.value })}
                        placeholder="Enter pickup location"
                      />
                      <div className="quick-chips">
                        {PRESET_LOCATIONS.slice(0, 4).map(loc => (
                          <button key={loc} type="button" onClick={() => setBookingForm({ ...bookingForm, pickup: loc })}>
                            {loc.split(",")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label><Navigation size={15} /> Drop Destination</label>
                      <input 
                        required
                        value={bookingForm.destination}
                        onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                        placeholder="Enter drop destination"
                      />
                      <div className="quick-chips">
                        {PRESET_LOCATIONS.slice(4).map(loc => (
                          <button key={loc} type="button" onClick={() => setBookingForm({ ...bookingForm, destination: loc })}>
                            {loc.split(",")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label><CarFront size={15} /> Vehicle Class</label>
                      <div className="car-type-selector">
                        {["Economy", "Comfort", "Premium"].map(tier => (
                          <button
                            key={tier}
                            type="button"
                            className={`car-type-btn ${bookingForm.carType === tier ? "selected" : ""}`}
                            onClick={() => setBookingForm({ ...bookingForm, carType: tier })}
                          >
                            <strong>{tier}</strong>
                            <span>{tier === "Economy" ? "Standard hatch" : tier === "Comfort" ? "Spacious Sedan" : "Luxury SUV"}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="fare-estimate-box">
                      <div>
                        <span>Upfront Fare ({surgeMultiplier}x Surge):</span>
                        <div className="estimate-price">{money(estimatedFare)}</div>
                      </div>
                      <button type="submit" disabled={submitting} className="primary-button book-now-btn">
                        <Plus size={16} /> {submitting ? "Booking..." : currentUser ? "Request Ride Now" : "Sign In & Request Ride"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="right-column">
                  <div className="panel tracker-card">
                    <div className="panel-heading compact">
                      <div>
                        <div className="panel-kicker">LIVE TRIP TRACKER</div>
                        <h2>Your Active Ride</h2>
                      </div>
                    </div>

                    <div className="tracker-body">
                      {activePassengerRide ? (
                        <div className="live-ride-tracker">
                          <div className="tracker-header">
                            <span className="ride-id-tag">RIDE #{activePassengerRide.id}</span>
                            <Status status={activePassengerRide.status} />
                          </div>

                          <div className="stepper-bar">
                            <div className={`step ${["Searching for driver", "Driver assigned", "Arrived at pickup", "In Progress", "Completed"].includes(activePassengerRide.status) ? "active" : ""}`}>Requested</div>
                            <div className={`step ${["Driver assigned", "Arrived at pickup", "In Progress", "Completed"].includes(activePassengerRide.status) ? "active" : ""}`}>Assigned</div>
                            <div className={`step ${["Arrived at pickup", "In Progress", "Completed"].includes(activePassengerRide.status) ? "active" : ""}`}>Arrived</div>
                            <div className={`step ${["In Progress", "Completed"].includes(activePassengerRide.status) ? "active" : ""}`}>On the Way</div>
                          </div>

                          <div className="tracker-driver-info">
                            {activePassengerRide.driverName ? (
                              <div className="driver-matched">
                                <div className="matched-avatar">D</div>
                                <div>
                                  <strong>{activePassengerRide.driverName}</strong>
                                  <p>{activePassengerRide.vehicle}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="searching-spinner">
                                <RefreshCw className="spin" size={18} />
                                <span>Searching for nearby available driver...</span>
                              </div>
                            )}
                          </div>

                          <div className="trip-route-summary">
                            <div><strong>From:</strong> {activePassengerRide.pickup}</div>
                            <div><strong>To:</strong> {activePassengerRide.destination}</div>
                            <div className="fare-line"><strong>Fare:</strong> {money(activePassengerRide.fare)}</div>
                          </div>

                          <button 
                            className="small-action-btn cancel"
                            onClick={() => updateRideStatus(activePassengerRide.id, "Cancelled")}
                          >
                            Cancel Ride Request
                          </button>
                        </div>
                      ) : (
                        <div className="no-active-ride">
                          <CheckCircle2 size={36} color="#10b981" className="animate-pulse" />
                          <p>No active ride in progress.</p>
                          <span>{currentUser ? 'Use the form on the left to request a ride anywhere!' : 'Sign in to view active ride tracker!'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel wallet-card">
                    <div className="panel-heading compact">
                      <div>
                        <div className="panel-kicker">DIGITAL PAYMENT</div>
                        <h2>RideFlow Wallet</h2>
                      </div>
                    </div>
                    <div className="wallet-body">
                      <div className="wallet-balance-row">
                        <Wallet size={24} className="wallet-icon" />
                        <div>
                          <span>Balance Available</span>
                          <strong className="balance-amount">{money(passengerUserDetail?.wallet || 850)}</strong>
                        </div>
                      </div>
                      <div className="topup-actions">
                        <span>Quick Top-Up:</span>
                        <button onClick={() => handleTopupWallet(200)}>+₹200</button>
                        <button onClick={() => handleTopupWallet(500)}>+₹500</button>
                        <button onClick={() => handleTopupWallet(1000)}>+₹1000</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel history-section" style={{ marginTop: '20px' }}>
                <div className="panel-heading compact">
                  <div>
                    <div className="panel-kicker">RIDE LOG</div>
                    <h2>Your Travel History</h2>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>RIDE ID</th>
                        <th>PICKUP & DROP</th>
                        <th>CLASS</th>
                        <th>DRIVER</th>
                        <th>FARE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passengerRides.length === 0 ? (
                        <tr><td colSpan="6" className="empty-state">{currentUser ? 'No ride history found.' : 'Sign in to view your ride history.'}</td></tr>
                      ) : (
                        passengerRides.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.id}</strong></td>
                            <td>{r.pickup} → {r.destination}</td>
                            <td><span className="car-tag">{r.carType || "Economy"}</span></td>
                            <td>{r.driverName || "N/A"}</td>
                            <td className="fare">{money(r.fare)}</td>
                            <td><Status status={r.status} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. ARCHITECTURE EXPLORER (HLD & LLD SPECS)                                 */}
          {/* ========================================================================= */}
          {activeTab === 'architecture' && (
            <div className="architecture-container animate-fade-in-up">
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="eyebrow-line" /> SYSTEM DESIGN SPECIFICATIONS</div>
                  <h1>Architecture Blueprint (HLD & LLD)<span>.</span></h1>
                  <p className="subtitle">High-Level & Low-Level software architecture diagrams, schemas, and design patterns.</p>
                </div>
                <div className="arch-subtab-switch">
                  <button className={`arch-subtab-btn ${archSubTab === 'hld' ? 'active' : ''}`} onClick={() => setArchSubTab('hld')}>
                    <Network size={16} /> High-Level Design (HLD)
                  </button>
                  <button className={`arch-subtab-btn ${archSubTab === 'lld' ? 'active' : ''}`} onClick={() => setArchSubTab('lld')}>
                    <Code2 size={16} /> Low-Level Design (LLD)
                  </button>
                </div>
              </section>

              {archSubTab === 'hld' && (
                <div className="arch-content-grid">
                  <div className="panel arch-diagram-panel">
                    <div className="panel-heading">
                      <div>
                        <div className="panel-kicker">SYSTEM TOPOLOGY</div>
                        <h2>High-Level Microservice Architecture</h2>
                        <p>End-to-end component flow from Client Apps to Data Store & Messaging Queues.</p>
                      </div>
                    </div>

                    <div className="hld-diagram-box">
                      <div className="arch-layer">
                        <div className="layer-title"><Users size={16} /> CLIENT & UI LAYER</div>
                        <div className="layer-cards">
                          <div className="arch-node client-node">
                            <User size={18} className="node-icon" />
                            <strong>Passenger App</strong>
                            <span>React / Web / Mobile</span>
                          </div>
                          <div className="arch-node client-node">
                            <CarFront size={18} className="node-icon" />
                            <strong>Rider / Driver App</strong>
                            <span>React / Web / Mobile</span>
                          </div>
                          <div className="arch-node client-node">
                            <ShieldCheck size={18} className="node-icon" />
                            <strong>Admin Web Console</strong>
                            <span>Operations Dashboard</span>
                          </div>
                        </div>
                      </div>

                      <div className="flow-arrow-down">
                        <ArrowRight size={18} className="arrow-icon animate-pulse" /> HTTPS REST & WebSockets Data Stream
                      </div>

                      <div className="arch-layer">
                        <div className="layer-title"><Server size={16} /> API GATEWAY & LOAD BALANCER</div>
                        <div className="layer-cards">
                          <div className="arch-node gateway-node">
                            <Zap size={18} className="node-icon animate-pulse" />
                            <strong>Express API Gateway (Port 4000)</strong>
                            <span>Rate Limiting · CORS Security · Auth JWT Validation</span>
                          </div>
                        </div>
                      </div>

                      <div className="flow-arrow-down">
                        <ArrowRight size={18} className="arrow-icon animate-pulse" /> Internal Microservices RPC
                      </div>

                      <div className="arch-layer">
                        <div className="layer-title"><Cpu size={16} /> CORE SERVICES ENGINE</div>
                        <div className="layer-cards multi">
                          <div className="arch-node service-node">
                            <Workflow size={18} className="node-icon" />
                            <strong>Ride Dispatcher Engine</strong>
                            <span>State Machine Lifecycle</span>
                          </div>
                          <div className="arch-node service-node">
                            <Navigation size={18} className="node-icon" />
                            <strong>Geo-Matching Engine</strong>
                            <span>H3 Spatial Index & Radar</span>
                          </div>
                          <div className="arch-node service-node">
                            <Wallet size={18} className="node-icon" />
                            <strong>Billing & Wallet Engine</strong>
                            <span>Upfront Pricing & Surge</span>
                          </div>
                        </div>
                      </div>

                      <div className="flow-arrow-down">
                        <ArrowRight size={18} className="arrow-icon animate-pulse" /> Persistence & Event Queue
                      </div>

                      <div className="arch-layer">
                        <div className="layer-title"><Database size={16} /> DATA & MESSAGING STORE</div>
                        <div className="layer-cards">
                          <div className="arch-node db-node">
                            <Database size={18} className="node-icon" />
                            <strong>PostgreSQL Primary DB</strong>
                            <span>User Profiles, Rides, Transactions</span>
                          </div>
                          <div className="arch-node db-node">
                            <Activity size={18} className="node-icon" />
                            <strong>Redis Spatial Cache</strong>
                            <span>Live Driver GPS & Quadtree</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="right-column">
                    <div className="panel arch-info-card">
                      <div className="panel-heading compact">
                        <div>
                          <div className="panel-kicker">DESIGN DECISIONS</div>
                          <h2>HLD Key Specifications</h2>
                        </div>
                      </div>
                      <div className="arch-feature-list">
                        <div className="feature-item">
                          <div className="feature-icon"><Zap size={18} /></div>
                          <div>
                            <strong>Sub-200ms Match Latency</strong>
                            <p>Geospatial Redis Quadtrees allow rapid driver lookup within $R$ radius in real-time.</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon"><Network size={18} /></div>
                          <div>
                            <strong>Bi-Directional WebSockets</strong>
                            <p>Real-time location streaming keeps driver position synchronized with passenger interface.</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon"><ShieldCheck size={18} /></div>
                          <div>
                            <strong>Fault Tolerance & Idempotency</strong>
                            <p>Transactions use idempotent payment keys to prevent double-charging during wallet top-ups.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {archSubTab === 'lld' && (
                <div className="arch-content-grid">
                  <div className="panel arch-diagram-panel">
                    <div className="panel-heading">
                      <div>
                        <div className="panel-kicker">LOW-LEVEL DESIGN</div>
                        <h2>Entity Schemas & Data Model (LLD)</h2>
                        <p>Database table definitions, field types, and entity relationships.</p>
                      </div>
                    </div>

                    <div className="lld-schema-grid">
                      <div className="schema-card">
                        <div className="schema-header">
                          <Database size={16} /> <code>rides</code> Table Schema
                        </div>
                        <div className="schema-body">
                          <div><code>id</code> <span>VARCHAR(36) PK</span></div>
                          <div><code>passenger_name</code> <span>VARCHAR(100)</span></div>
                          <div><code>pickup</code> <span>TEXT NOT NULL</span></div>
                          <div><code>destination</code> <span>TEXT NOT NULL</span></div>
                          <div><code>status</code> <span>ENUM('Searching', 'Assigned', 'Completed')</span></div>
                          <div><code>driver_id</code> <span>VARCHAR(36) FK</span></div>
                          <div><code>fare</code> <span>DECIMAL(10,2)</span></div>
                          <div><code>created_at</code> <span>TIMESTAMP</span></div>
                        </div>
                      </div>

                      <div className="schema-card">
                        <div className="schema-header">
                          <Users size={16} /> <code>users</code> Table Schema
                        </div>
                        <div className="schema-body">
                          <div><code>id</code> <span>VARCHAR(36) PK</span></div>
                          <div><code>name</code> <span>VARCHAR(100)</span></div>
                          <div><code>email</code> <span>VARCHAR(255) UNIQUE</span></div>
                          <div><code>role</code> <span>ENUM('admin', 'rider', 'user')</span></div>
                          <div><code>wallet_balance</code> <span>DECIMAL(10,2)</span></div>
                          <div><code>phone</code> <span>VARCHAR(20)</span></div>
                        </div>
                      </div>

                      <div className="schema-card">
                        <div className="schema-header">
                          <CarFront size={16} /> <code>drivers</code> Table Schema
                        </div>
                        <div className="schema-body">
                          <div><code>id</code> <span>VARCHAR(36) PK</span></div>
                          <div><code>vehicle_model</code> <span>VARCHAR(100)</span></div>
                          <div><code>license_plate</code> <span>VARCHAR(50)</span></div>
                          <div><code>is_available</code> <span>BOOLEAN DEFAULT true</span></div>
                          <div><code>rating</code> <span>DECIMAL(2,1)</span></div>
                          <div><code>earnings</code> <span>DECIMAL(10,2)</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="state-machine-box">
                      <div className="panel-kicker">FINITE STATE MACHINE DIAGRAM</div>
                      <h3>Ride Lifecycle Transition Pipeline</h3>
                      <div className="state-flow-pipeline">
                        <span className="state-node start animate-pulse">Searching for Driver</span>
                        <ArrowRight size={14} className="state-arrow" />
                        <span className="state-node assigned">Driver Assigned</span>
                        <ArrowRight size={14} className="state-arrow" />
                        <span className="state-node arrived">Arrived at Pickup</span>
                        <ArrowRight size={14} className="state-arrow" />
                        <span className="state-node progress">In Progress</span>
                        <ArrowRight size={14} className="state-arrow" />
                        <span className="state-node completed">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="right-column">
                    <div className="panel arch-info-card">
                      <div className="panel-heading compact">
                        <div>
                          <div className="panel-kicker">PRICING ALGORITHM</div>
                          <h2>Upfront Fare Code Implementation</h2>
                        </div>
                      </div>
                      <div className="code-snippet-box">
                        <pre><code>{`// Low-Level Upfront Pricing Formula
function calculateFare(pickup, drop, tier, surge = 1.0) {
  const baseFares = {
    Economy: 110,
    Comfort: 160,
    Premium: 220
  };

  const base = baseFares[tier] ?? 110;
  const dist = pickup.length + drop.length;
  
  // Calculate fare with surge factor
  const fare = Math.round((base + dist * 3.5) * surge);
  
  return Math.max(fare, 80); // Minimum fare guarantee
}`}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <footer className="footer">
            <span>© 2026 RideFlow Mobility Platform</span>
            <span><span className="footer-dot" /> Multi-Role Architecture + Interactive API Explorer & Live Tester</span>
          </footer>
        </div>
      </main>

      {/* Dispatch Ride Modal */}
      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal animate-scale-up">
            <div className="modal-header">
              <div>
                <div className="panel-kicker">ADMIN DISPATCH</div>
                <h2>Create Ride Request</h2>
                <p>Submit a new ride request directly to the server dispatch system.</p>
              </div>
              <button className="icon-button" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateRide}>
              <label>
                Passenger Name
                <input required minLength="2" value={bookingForm.passengerName} onChange={(e) => setBookingForm({ ...bookingForm, passengerName: e.target.value })} placeholder="e.g. Keerthana" />
              </label>
              <label>
                <span><MapPin size={14} /> Pickup Location</span>
                <input required value={bookingForm.pickup} onChange={(e) => setBookingForm({ ...bookingForm, pickup: e.target.value })} placeholder="Enter pickup location" />
              </label>
              <label>
                <span><Navigation size={14} /> Destination</span>
                <input required value={bookingForm.destination} onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })} placeholder="Enter destination" />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button disabled={submitting} className="primary-button" type="submit">
                  <Plus size={16} />{submitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENHANCED INTERACTIVE API EXPLORER MODAL WITH LIVE TESTER */}
      {showApi && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowApi(false); }}>
          <div className="modal api-modal-enhanced animate-scale-up">
            <div className="modal-header">
              <div>
                <div className="panel-kicker">INTERACTIVE REST API EXPLORER</div>
                <h2>Backend Endpoints & Live API Tester</h2>
                <p>Inspect request schemas, parameters, and execute live API calls directly against the Node server.</p>
              </div>
              <button className="icon-button" onClick={() => setShowApi(false)}><X size={18} /></button>
            </div>

            <div className="api-explorer-body">
              {/* Left Endpoints List */}
              <div className="api-endpoints-sidebar">
                <div className="api-sidebar-header">ENDPOINTS ({API_ENDPOINTS_DATA.length})</div>
                <div className="api-sidebar-list">
                  {API_ENDPOINTS_DATA.map((ep) => (
                    <div 
                      key={ep.method + ep.path}
                      className={`api-sidebar-item ${selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method ? 'active' : ''}`}
                      onClick={() => { setSelectedEndpoint(ep); setApiTestResponse(null); }}
                    >
                      <span className={`method method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <code className="ep-path-text">{ep.path}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Interactive Detail & Tester Panel */}
              <div className="api-detail-panel">
                <div className="api-detail-header">
                  <div className="ep-title-row">
                    <span className={`method method-${selectedEndpoint.method.toLowerCase()}`}>{selectedEndpoint.method}</span>
                    <code className="ep-main-path">http://localhost:4000/api{selectedEndpoint.path}</code>
                  </div>
                  <h3>{selectedEndpoint.title}</h3>
                  <p>{selectedEndpoint.description}</p>
                </div>

                <div className="api-detail-content">
                  {selectedEndpoint.sampleRequest && (
                    <div className="api-spec-box">
                      <div className="spec-box-header"><FileCode size={14} /> Request Body Schema (JSON)</div>
                      <pre><code>{JSON.stringify(selectedEndpoint.sampleRequest, null, 2)}</code></pre>
                    </div>
                  )}

                  <div className="api-action-row">
                    <button 
                      className="primary-button test-api-btn"
                      disabled={apiTesting}
                      onClick={() => testApiEndpoint(selectedEndpoint)}
                    >
                      <Send size={15} /> {apiTesting ? "Executing Request..." : "Run Live API Request"}
                    </button>
                  </div>

                  {/* Live API Call Result */}
                  {apiTestResponse && (
                    <div className="api-test-result-box animate-fade-in">
                      <div className="result-header">
                        <span className={`result-status ${apiTestResponse.ok ? 'status-ok' : 'status-err'}`}>
                          HTTP {apiTestResponse.status} {apiTestResponse.statusText}
                        </span>
                        <span className="result-time">Response Time: {apiTestResponse.time}ms</span>
                      </div>
                      <div className="result-json">
                        <pre><code>{JSON.stringify(apiTestResponse.data, null, 2)}</code></pre>
                      </div>
                    </div>
                  )}

                  {!apiTestResponse && (
                    <div className="api-spec-box default-response-box">
                      <div className="spec-box-header"><CheckCircle2 size={14} /> Expected Sample Response (200 OK)</div>
                      <pre><code>{JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}</code></pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ padding: '14px 24px', borderTop: '1px solid var(--slate-200)' }}>
              <button className="secondary-button" onClick={() => setShowApi(false)}>Close API Explorer</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Login & Preset Account Selector Modal */}
      {showLoginModal && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}>
          <div className="modal login-modal animate-scale-up">
            <div className="modal-header">
              <div>
                <div className="panel-kicker">SYSTEM AUTHENTICATION</div>
                <h2>Sign In to RideFlow</h2>
                <p>Enter your credentials or choose a quick demo account.</p>
              </div>
              <button className="icon-button" onClick={() => setShowLoginModal(false)}><X size={18} /></button>
            </div>

            <div className="auth-tab-bar">
              <button className={`auth-tab-btn ${loginTab === 'login' ? 'active' : ''}`} onClick={() => setLoginTab('login')}>
                <KeyRound size={15} /> Manual Sign In
              </button>
              <button className={`auth-tab-btn ${loginTab === 'preset' ? 'active' : ''}`} onClick={() => setLoginTab('preset')}>
                <User size={15} /> Quick Demo Profiles
              </button>
            </div>

            {authError && (
              <div className="alert alert-error animate-fade-in" style={{ margin: '14px 24px 0' }}>
                <CircleHelp size={16} /> <span>{authError}</span>
              </div>
            )}

            {loginTab === 'login' ? (
              <form onSubmit={handleManualSubmit} className="manual-auth-form">
                <label>
                  <span><Mail size={14} /> Email Address</span>
                  <input type="email" required value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} placeholder="e.g. keerthana@rideflow.com" />
                </label>

                <label>
                  <span><Lock size={14} /> Password</span>
                  <input type="password" required value={manualForm.password} onChange={(e) => setManualForm({ ...manualForm, password: e.target.value })} placeholder="••••••••••••" />
                </label>

                <label>
                  <span><Users size={14} /> Access Role</span>
                  <select value={manualForm.role} onChange={(e) => setManualForm({ ...manualForm, role: e.target.value })} className="role-auth-select">
                    <option value="user">Passenger (User)</option>
                    <option value="rider">Rider / Driver Partner</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </label>

                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={() => setShowLoginModal(false)}>Cancel</button>
                  <button className="primary-button" type="submit"><LogIn size={16} /> Log In Now</button>
                </div>
              </form>
            ) : (
              <div className="account-select-list">
                <div className="account-section-title">ADMINISTRATOR</div>
                <div className="account-card" onClick={() => switchRole('admin')}>
                  <div className="avatar">ADM</div>
                  <div>
                    <strong>Admin Operations</strong>
                    <p>Full operations dashboard & fleet controls</p>
                  </div>
                </div>

                <div className="account-section-title">RIDER PARTNERS (DRIVERS)</div>
                {PRESET_USERS.riders.map(r => (
                  <div className="account-card" key={r.id} onClick={() => switchRole('rider', r)}>
                    <div className="avatar">{r.avatar}</div>
                    <div>
                      <strong>{r.name} ({r.vehicle})</strong>
                      <p>Rating: ★ {r.rating} · {r.email}</p>
                    </div>
                  </div>
                ))}

                <div className="account-section-title">PASSENGERS (USERS)</div>
                {PRESET_USERS.passengers.map(p => (
                  <div className="account-card" key={p.id} onClick={() => switchRole('passenger', p)}>
                    <div className="avatar">{p.avatar}</div>
                    <div>
                      <strong>{p.name}</strong>
                      <p>{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, note, icon, trend, tone }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <div className={`metric-icon ${tone}`}>{icon}</div>
        <span className="metric-tag">{trend}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

export default App;
