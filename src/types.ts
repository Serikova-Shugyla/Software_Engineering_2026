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
  blocked: boolean;
}
