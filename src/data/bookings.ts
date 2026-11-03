import type { Booking } from "../types";

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: "b1", roomId: "r1", start: 540, end: 630, title: "Intro to CS", bookedBy: "Prof. Lee" },
  { id: "b2", roomId: "r1", start: 780, end: 840, title: "Faculty Meeting", bookedBy: "Admin" },
  { id: "b3", roomId: "r2", start: 600, end: 660, title: "Physics Lab", bookedBy: "Prof. Garcia" },
  { id: "b4", roomId: "r3", start: 480, end: 510, title: "Group Study", bookedBy: "Student Council" },
  { id: "b5", roomId: "r5", start: 900, end: 990, title: "Guest Lecture", bookedBy: "Prof. Singh" },
  { id: "b6", roomId: "r2", start: 840, end: 900, title: "Robotics Workshop", bookedBy: "Prof. Chen" },
  { id: "b7", roomId: "r3", start: 720, end: 780, title: "Tutoring Session", bookedBy: "Writing Center" },
];
