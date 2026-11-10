import { useGetAvailableJobCountQuery } from "@/features/job/api/jobsApi";
import { useAppSelector } from "@/store/hooks";

export function useAvailableJobCount() {
  const user = useAppSelector((state) => state.auth.user);
  const { currentData } = useGetAvailableJobCountQuery(undefined, {
    skip: !user,
    pollingInterval: 15000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 15,
  });
  return currentData;
}
