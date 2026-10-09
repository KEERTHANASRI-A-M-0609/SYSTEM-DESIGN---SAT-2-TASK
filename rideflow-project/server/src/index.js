import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

// Preset system users for role authentication
let users = [
  { id: "U-1", name: "Admin Operations", email: "admin@rideflow.com", role: "admin", avatar: "ADM", phone: "+91 90000 00000" },
  { id: "D-101", name: "Arun Kumar", email: "arun@rideflow.com", role: "rider", avatar: "AK", vehicle: "Hyundai Aura", plate: "TN 38 AB 4120", rating: 4.9, eta: "3 min", available: true, earnings: 1450, phone: "+91 98765 43210" },
  { id: "D-102", name: "Priya S", email: "priya@rideflow.com", role: "rider", avatar: "PS", vehicle: "Maruti Swift", plate: "TN 37 CD 2086", rating: 4.8, eta: "5 min", available: true, earnings: 2100, phone: "+91 98765 43211" },
  { id: "D-103", name: "Mohammed I", email: "mohammed@rideflow.com", role: "rider", avatar: "MI", vehicle: "Tata Tigor", plate: "TN 66 EF 9031", rating: 4.7, eta: "7 min", available: false, earnings: 890, phone: "+91 98765 43212" },
  { id: "U-101", name: "Ananya Rao", email: "ananya@rideflow.com", role: "user", avatar: "AR", wallet: 1250, phone: "+91 91234 56789" },
  { id: "U-102", name: "Rohan M", email: "rohan@rideflow.com", role: "user", avatar: "RM", wallet: 450, phone: "+91 91234 56790" },
  { id: "U-103", name: "Meera K", email: "meera@rideflow.com", role: "user", avatar: "MK", wallet: 820, phone: "+91 91234 56791" }
];

let nextRideNumber = 1004;
let rides = [
  {
    id: "R-1001",
    passengerName: "Ananya Rao",
    passengerEmail: "ananya@rideflow.com",
    pickup: "Peelamedu, Coimbatore",
    destination: "Gandhipuram Bus Stand",
    carType: "Comfort",
    status: "Driver assigned",
    driverId: "D-101",
    driverName: "Arun Kumar",
    vehicle: "Hyundai Aura (TN 38 AB 4120)",
    fare: 245,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: "R-1002",
    passengerName: "Rohan M",
    passengerEmail: "rohan@rideflow.com",
    pickup: "PSG Tech",
    destination: "Coimbatore Airport",
    carType: "Premium",
    status: "Completed",
    driverId: "D-102",
    driverName: "Priya S",
    vehicle: "Maruti Swift (TN 37 CD 2086)",
    fare: 310,
    createdAt: new Date(Date.now() - 1000 * 60 * 54).toISOString()
  },
  {
    id: "R-1003",
    passengerName: "Meera K",
    passengerEmail: "meera@rideflow.com",
    pickup: "Brookefields Mall",
    destination: "Race Course",
    carType: "Economy",
    status: "Searching for driver",
    driverId: null,
    driverName: null,
    vehicle: null,
    fare: 180,
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  }
];

const sendError = (res, status, message) => res.status(status).json({ error: message });

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "RideFlow API", timestamp: new Date().toISOString() });
});

// Auth & Users API
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body ?? {};
  let user = users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user && role) {
    user = users.find(u => u.role === role);
  }
  if (!user) {
    user = users[0]; // fallback to admin
  }
  res.json({ message: "Login successful", user });
});

app.get("/api/users", (_req, res) => {
  res.json({ count: users.length, users });
});

app.get("/api/users/:email", (req, res) => {
  const user = users.find(u => u.email.toLowerCase() === req.params.email.toLowerCase());
  if (!user) return sendError(res, 404, "User not found");
  res.json({ user });
});

app.post("/api/users/wallet", (req, res) => {
  const { email, amount } = req.body ?? {};
  const user = users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) return sendError(res, 404, "User not found");
  if (!amount || isNaN(amount) || amount <= 0) return sendError(res, 400, "Valid top-up amount required");

  user.wallet = (user.wallet || 0) + Number(amount);
  res.json({ message: "Wallet updated successfully", wallet: user.wallet, user });
});

// Drivers API
app.get("/api/drivers", (_req, res) => {
  const driversList = users.filter(u => u.role === "rider");
  res.json({ count: driversList.length, drivers: driversList });
});

app.patch("/api/drivers/:id/status", (req, res) => {
  const driver = users.find(u => u.id === req.params.id && u.role === "rider");
  if (!driver) return sendError(res, 404, "Driver not found");

  if (typeof req.body.available === "boolean") {
    driver.available = req.body.available;
  }
  res.json({ message: "Driver availability updated", driver });
});

// Admin Stats API
app.get("/api/admin/stats", (_req, res) => {
  const driversList = users.filter(u => u.role === "rider");
  const activeRides = rides.filter(r => !["Completed", "Cancelled"].includes(r.status));
  const completedRides = rides.filter(r => r.status === "Completed");
  const totalRevenue = rides.reduce((sum, r) => sum + (r.fare || 0), 0);
  const availableDrivers = driversList.filter(d => d.available).length;

  res.json({
    totalRides: rides.length,
    activeRides: activeRides.length,
    completedRides: completedRides.length,
    cancelledRides: rides.filter(r => r.status === "Cancelled").length,
    totalRevenue,
    totalDrivers: driversList.length,
    availableDrivers,
    totalPassengers: users.filter(u => u.role === "user").length
  });
});

// Rides API
app.get("/api/rides", (req, res) => {
  const { status, driverId, passengerEmail } = req.query;
  let result = rides;

  if (status) {
    result = result.filter(r => r.status.toLowerCase() === String(status).toLowerCase());
  }
  if (driverId) {
    result = result.filter(r => r.driverId === driverId);
  }
  if (passengerEmail) {
    result = result.filter(r => (r.passengerEmail || "").toLowerCase() === String(passengerEmail).toLowerCase());
  }

  res.json({ count: result.length, rides: result });
});

app.get("/api/rides/:id", (req, res) => {
  const ride = rides.find(item => item.id === req.params.id);
  if (!ride) return sendError(res, 404, "Ride not found");
  res.json({ ride });
});

app.post("/api/rides", (req, res) => {
  const { passengerName, passengerEmail, pickup, destination, carType } = req.body ?? {};
  if (![passengerName, pickup, destination].every(v => typeof v === "string" && v.trim())) {
    return sendError(res, 400, "passengerName, pickup, and destination are required");
  }
  if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
    return sendError(res, 400, "Pickup and destination must be different");
  }

  const driversList = users.filter(u => u.role === "rider");
  const availableDriver = driversList.find(driver => driver.available);

  const baseFare = carType === "Premium" ? 220 : carType === "Comfort" ? 160 : 110;
  const calculatedFare = Math.round(baseFare + (pickup.trim().length + destination.trim().length) * 3.5);

  const ride = {
    id: `R-${nextRideNumber++}`,
    passengerName: passengerName.trim(),
    passengerEmail: passengerEmail || `${passengerName.toLowerCase().replace(/\s+/g, '')}@rideflow.com`,
    pickup: pickup.trim(),
    destination: destination.trim(),
    carType: carType || "Economy",
    status: availableDriver ? "Driver assigned" : "Searching for driver",
    driverId: availableDriver?.id ?? null,
    driverName: availableDriver?.name ?? null,
    vehicle: availableDriver ? `${availableDriver.vehicle} (${availableDriver.plate})` : null,
    fare: calculatedFare,
    createdAt: new Date().toISOString()
  };

  if (availableDriver) {
    availableDriver.available = false; // set busy
  }

  rides = [ride, ...rides];
  res.status(201).json({ message: "Ride request created successfully", ride });
});

// Update Ride Status (for Riders & Admin)
app.patch("/api/rides/:id/status", (req, res) => {
  const ride = rides.find(item => item.id === req.params.id);
  if (!ride) return sendError(res, 404, "Ride not found");

  const { status, driverId } = req.body ?? {};
  const validStatuses = ["Searching for driver", "Driver assigned", "Arrived at pickup", "In Progress", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  ride.status = status;

  if (driverId) {
    const driver = users.find(u => u.id === driverId && u.role === "rider");
    if (driver) {
      ride.driverId = driver.id;
      ride.driverName = driver.name;
      ride.vehicle = `${driver.vehicle} (${driver.plate})`;
    }
  }

  // Handle availability and earnings on Completion / Cancellation
  if (status === "Completed" || status === "Cancelled") {
    if (ride.driverId) {
      const driver = users.find(u => u.id === ride.driverId && u.role === "rider");
      if (driver) {
        driver.available = true; // free up driver
        if (status === "Completed") {
          driver.earnings = (driver.earnings || 0) + ride.fare;
        }
      }
    }
  }

  res.json({ message: `Ride status updated to ${status}`, ride });
});

// Manual driver assignment (Admin)
app.post("/api/rides/:id/assign", (req, res) => {
  const ride = rides.find(item => item.id === req.params.id);
  if (!ride) return sendError(res, 404, "Ride not found");

  const { driverId } = req.body ?? {};
  const driver = users.find(u => u.id === driverId && u.role === "rider");
  if (!driver) return sendError(res, 404, "Driver not found");

  ride.driverId = driver.id;
  ride.driverName = driver.name;
  ride.vehicle = `${driver.vehicle} (${driver.plate})`;
  ride.status = "Driver assigned";
  driver.available = false;

  res.json({ message: `Assigned ride to driver ${driver.name}`, ride });
});

app.patch("/api/rides/:id/cancel", (req, res) => {
  const ride = rides.find((item) => item.id === req.params.id);
  if (!ride) return sendError(res, 404, "Ride not found");
  if (["Completed", "Cancelled"].includes(ride.status)) {
    return sendError(res, 409, `A ${ride.status.toLowerCase()} ride cannot be cancelled`);
  }

  if (ride.driverId) {
    const driver = users.find(u => u.id === ride.driverId && u.role === "rider");
    if (driver) driver.available = true;
  }

  ride.status = "Cancelled";
  res.json({ message: "Ride cancelled", ride });
});

app.use((_req, res) => sendError(res, 404, "Endpoint not found"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`RideFlow API running at http://localhost:${PORT}`);
});
