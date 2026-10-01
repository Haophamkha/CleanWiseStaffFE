import type { PickedFile } from "@/features/profile-setup/types/WorkerProfile";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** null = người dùng chưa chạm vào, dùng giá trị đang có trên server. */
export type ProfileDraft = {
  userId: number | null;
  portrait: PickedFile | null;
  identityNumber: string | null;
  identityFront: PickedFile | null;
  identityBack: PickedFile | null;
  serviceId: number | null;
  areaIds: number[] | null;
  provinceCode: string | null;
  bio: string | null;
  experienceYears: string | null;
  certificate: PickedFile | null;
};

const initialState: ProfileDraft = {
  userId: null,
  portrait: null,
  identityNumber: null,
  identityFront: null,
  identityBack: null,
  serviceId: null,
  areaIds: null,
  provinceCode: null,
  bio: null,
  experienceYears: null,
  certificate: null,
};

const profileDraftSlice = createSlice({
  name: "profileDraft",
  initialState,
  reducers: {
    patchDraft: (
      state,
      action: PayloadAction<Partial<Omit<ProfileDraft, "userId">>>,
    ) => {
      Object.assign(state, action.payload);
    },
    resetDraft: (_state, action: PayloadAction<number | null>) => ({
      ...initialState,
      userId: action.payload,
    }),
  },
});

export const { patchDraft, resetDraft } = profileDraftSlice.actions;
export default profileDraftSlice.reducer;
