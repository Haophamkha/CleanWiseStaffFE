export type Area = {
  id: number;
  name: string;
  city: string;
};

export type WorkingArea = {
  id: number;
  area: Area;
  created_at: string;
};
