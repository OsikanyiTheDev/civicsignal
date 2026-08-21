export const incidentCategories = [
  "Water",
  "Drainage",
  "Waste",
  "Streetlight",
  "Road safety",
  "Other",
] as const;

export const incidentStatuses = ["Submitted", "Verified", "In progress", "Resolved"] as const;

export type IncidentCategory = (typeof incidentCategories)[number];
export type IncidentStatus = (typeof incidentStatuses)[number];

export type Incident = {
  id: string;
  title: string;
  category: IncidentCategory;
  status: IncidentStatus;
  area: string;
  reportedAt: string;
  summary: string;
  urgency: "Low" | "Medium" | "High";
  emoji: string;
  updates: number;
};

export const categoryMeta: Record<IncidentCategory, { emoji: string; accent: string }> = {
  Water: { emoji: "💧", accent: "cyan" },
  Drainage: { emoji: "🌧️", accent: "blue" },
  Waste: { emoji: "♻️", accent: "green" },
  Streetlight: { emoji: "💡", accent: "amber" },
  "Road safety": { emoji: "🚧", accent: "orange" },
  Other: { emoji: "📍", accent: "violet" },
};

export const demoIncidents: Incident[] = [
  {
    id: "CS-1042",
    title: "Standing water blocking a pedestrian crossing",
    category: "Drainage",
    status: "In progress",
    area: "Riverside district",
    reportedAt: "Today · 09:20",
    summary: "Community members reported pooled rainwater near a busy crossing. The report is awaiting a field update.",
    urgency: "High",
    emoji: "🌧️",
    updates: 3,
  },
  {
    id: "CS-1041",
    title: "Streetlight outage near evening commuter route",
    category: "Streetlight",
    status: "Verified",
    area: "East Market",
    reportedAt: "Today · 08:05",
    summary: "Multiple lights appear to be out along a short route used by pedestrians after dark.",
    urgency: "Medium",
    emoji: "💡",
    updates: 2,
  },
  {
    id: "CS-1039",
    title: "Overflowing collection point needs attention",
    category: "Waste",
    status: "Submitted",
    area: "Central ward",
    reportedAt: "Yesterday · 16:40",
    summary: "A collection point has exceeded capacity. Submitted for verification before a public resolution update.",
    urgency: "Medium",
    emoji: "♻️",
    updates: 1,
  },
  {
    id: "CS-1036",
    title: "Intermittent water access reported by residents",
    category: "Water",
    status: "Resolved",
    area: "Northside",
    reportedAt: "Yesterday · 11:15",
    summary: "The reporter confirmed water access returned after a local maintenance update.",
    urgency: "High",
    emoji: "💧",
    updates: 5,
  },
  {
    id: "CS-1031",
    title: "Damaged lane marker at school-zone crossing",
    category: "Road safety",
    status: "Verified",
    area: "South Junction",
    reportedAt: "Mon · 14:10",
    summary: "The marker is faded near a crossing. The issue was verified and placed in the action queue.",
    urgency: "Low",
    emoji: "🚧",
    updates: 2,
  },
];
