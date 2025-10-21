import useSWR, { SWRConfiguration } from 'swr';
import { api } from '@/lib/api';
import { Meeting, User, UserPreferences } from '@/types';

// SWR fetcher functions
const fetchers = {
  meetings: () => api.meetings.list(),
  meeting: (id: string) => api.meetings.getById(id),
  settings: () => api.settings.get(),
  profile: () => api.auth.getProfile(),
};

// Custom hook for meetings list
export function useMeetings(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Meeting[]>(
    'meetings',
    fetchers.meetings,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      ...options,
    }
  );

  return {
    meetings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for single meeting
export function useMeeting(id: string | undefined, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<Meeting>(
    id ? ['meeting', id] : null,
    id ? () => fetchers.meeting(id) : null,
    {
      revalidateOnFocus: true,
      ...options,
    }
  );

  return {
    meeting: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for user settings
export function useSettings(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<UserPreferences>(
    'settings',
    fetchers.settings,
    {
      revalidateOnFocus: false,
      ...options,
    }
  );

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Custom hook for user profile
export function useProfile(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    'profile',
    fetchers.profile,
    {
      revalidateOnFocus: false,
      ...options,
    }
  );

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Mutation helpers
export async function generateBriefing(meetingId: string) {
  return await api.meetings.generate(meetingId);
}

export async function updateSettings(data: Partial<UserPreferences>) {
  return await api.settings.update(data);
}

