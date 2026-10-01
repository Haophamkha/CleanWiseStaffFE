export type Area = {
  id: number;
  name: string;
  city: string;
  province_code: string;
  ward_code: string;
};

export type Province = {
  province_code: string;
  city: string;
};

export type WorkingArea = {
  id: number;
  area: Area;
  created_at: string;
};
