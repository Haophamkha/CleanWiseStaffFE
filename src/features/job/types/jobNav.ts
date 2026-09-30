export type Tab = "available" | "mine";
export type OpenJob = (id: number, source: Tab, bookingId?: number) => void;
