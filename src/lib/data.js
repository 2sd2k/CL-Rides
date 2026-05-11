export const SEED_APPROVED = {
  "dan@grace.org":    { name: "Pastor Dan",   role: "admin"  },
  "marcus@grace.org": { name: "Marcus Tate",  role: "driver" },
  "sofia@grace.org":  { name: "Sofia Reyes",  role: "driver" },
  "ellis@grace.org":  { name: "Ellis Park",   role: "driver" },
};

export const EVENTS = [
  {
    id: "sun-svc",
    name: "Sunday service",
    date: "May 11, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    location: "Grace Community Church",
    attending: 14,
    color: "#7F77DD",
    drivers: [
      { id: "mt", name: "Marcus Tate", seatsTotal: 4, seatsTaken: 2 },
      { id: "sr", name: "Sofia Reyes", seatsTotal: 3, seatsTaken: 3 },
    ],
  },
  {
    id: "bible-study",
    name: "Bible study",
    date: "May 14, 2026",
    time: "7:00 PM",
    duration: "1 hour",
    location: "Tate residence",
    attending: 8,
    color: "#1D9E75",
    drivers: [
      { id: "ep", name: "Ellis Park", seatsTotal: 4, seatsTaken: 1 },
    ],
  },
  {
    id: "youth-retreat",
    name: "Youth retreat",
    date: "May 16, 2026",
    time: "9:00 AM",
    duration: "All day",
    location: "Camp Hollowbrook",
    attending: 22,
    color: "#D85A30",
    drivers: [
      { id: "mt", name: "Marcus Tate", seatsTotal: 4, seatsTaken: 0 },
      { id: "sr", name: "Sofia Reyes", seatsTotal: 3, seatsTaken: 1 },
      { id: "ep", name: "Ellis Park",  seatsTotal: 4, seatsTaken: 2 },
    ],
  },
];

export const STORAGE_KEY = "cl_rides_state_v1";

export function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(s) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}
