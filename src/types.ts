export type Equipment =
  | "projector"
  | "whiteboard"
  | "computers"
  | "microphone"
  | "video-conferencing";

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
  title: string;
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: Equipment[];
  blocked: boolean;
}

/** What the user asks for in the filter panel (F1, F2). attendees = 0 means "no minimum". */
export interface RoomRequirements {
  attendees: number;
  equipment: Equipment[];
}
