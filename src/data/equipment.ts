import type { Equipment } from "../types";

export const EQUIPMENT_OPTIONS: ReadonlyArray<{ id: Equipment; label: string }> = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "computers", label: "Computers" },
  { id: "microphone", label: "Microphone" },
  { id: "video-conferencing", label: "Video conferencing" },
];
