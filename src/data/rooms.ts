import type { Room } from "../types";

// Fictional catalog (>= 4 rooms). Each room has its own capacity, equipment and blocked flag.
// Its bookings live in data/bookings.ts and are linked by roomId (see domain/bookings.ts).
export const SAMPLE_ROOMS: Room[] = [
  { id: "r1", name: "Auditorium A", building: "North Wing", capacity: 200, equipment: ["projector", "microphone", "video-conferencing"], blocked: false },
  { id: "r2", name: "Lab 101", building: "Tech Block", capacity: 40, equipment: ["computers", "projector", "whiteboard"], blocked: false },
  { id: "r3", name: "Study Room 204", building: "Central Library", capacity: 12, equipment: ["whiteboard"], blocked: false },
  { id: "r4", name: "Conference B", building: "South Wing", capacity: 30, equipment: ["projector", "video-conferencing", "whiteboard"], blocked: true },
  { id: "r5", name: "Lecture Hall 3", building: "Main Building", capacity: 150, equipment: ["projector", "microphone", "whiteboard"], blocked: false },
];
