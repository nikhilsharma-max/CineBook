import axios, { type AxiosResponse } from 'axios';
import type { Booking, CreateProfileInput, Movie, Profile, SeatMapItem, Show, Theatre } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function apiRequest<T>(action: string, request: () => Promise<AxiosResponse<T>>): Promise<T> {
  if (import.meta.env.DEV) console.info(`[CineBook] ${action} API request started`);
  try {
    const response = await request();
    if (import.meta.env.DEV) {
      console.info(`[CineBook] ${action} API response: ${response.status}`);
      console.info(`[CineBook] ${action} API request succeeded`);
    }
    return response.data;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (import.meta.env.DEV) console.error(`[CineBook] ${action} API request failed${status ? ` (${status})` : ''}`);
    throw error;
  }
}

function expectArray<T>(value: T[], action: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`The ${action} response was not a list. Please try again.`);
  }
  return value;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const data: unknown = error.response?.data;
    const message = typeof data === 'string'
      ? data
      : data && typeof data === 'object' && 'message' in data
        ? data.message
        : undefined;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const getMovies = async (): Promise<Movie[]> => {
  return expectArray(await apiRequest('Movie listing', () => api.get<Movie[]>('/movies')), 'movie listing');
};

export const getTheatres = async (city: string): Promise<Theatre[]> => {
  return expectArray(await apiRequest('Theatre listing', () => api.get<Theatre[]>('/theatres', { params: { city } })), 'theatre listing');
};

export const getShows = async (city: string, date: string): Promise<Show[]> => {
  const requestUrl = api.getUri({ url: '/shows', params: { city, date } });
  const shows = expectArray(await apiRequest(
    `Show listing (${city}, ${date})`,
    () => api.get<Show[]>('/shows', { params: { city, date } }),
  ), 'show listing');
  if (import.meta.env.DEV) {
    console.info('[CineBook] Show request', {
      city,
      date,
      url: requestUrl,
      returnedShows: shows.length,
    });
  }
  return shows;
};

export const getShowSeats = async (showId: number): Promise<SeatMapItem[]> => {
  return expectArray(await apiRequest('Seat availability', () => api.get<SeatMapItem[]>(`/shows/${showId}/seats`)), 'seat availability');
};

export const createProfile = async (payload: CreateProfileInput): Promise<Profile> => {
  const profile = await apiRequest('Registration', () => api.post<Profile>('/profiles', payload));
  if (!profile || typeof profile.id !== 'number' || typeof profile.name !== 'string') {
    throw new Error('The registration response was incomplete. Please try again.');
  }
  return profile;
};

export const loginProfile = async (identifier: string): Promise<Profile> => {
  const profile = await apiRequest('Login', () => api.get<Profile>('/profiles/login', { params: { identifier } }));
  if (!profile || typeof profile.id !== 'number' || typeof profile.name !== 'string') {
    throw new Error('The login response was incomplete. Please try again.');
  }
  return profile;
};

export const getProfileBookings = async (profileId: number): Promise<Booking[]> => {
  return expectArray(await apiRequest('Booking history', () => api.get<Booking[]>(`/profiles/${profileId}/bookings`)), 'booking history');
};

export const getBooking = async (bookingId: number): Promise<Booking> => {
  const booking = await apiRequest('Booking details', () => api.get<Booking>(`/bookings/${bookingId}`));
  if (!booking || typeof booking.id !== 'number' || !Array.isArray(booking.seatLabels)) {
    throw new Error('The booking details response was incomplete. Please try again.');
  }
  return booking;
};

export const createBooking = async (showId: number, payload: { profileId: number; seatLabels: string[] }): Promise<Booking> => {
  const booking = await apiRequest('Booking', () => api.post<Booking>(`/bookings/shows/${showId}`, payload));
  if (!booking || typeof booking.id !== 'number' || !Array.isArray(booking.seatLabels)) {
    throw new Error('The booking response was incomplete. Check your bookings before retrying.');
  }
  return booking;
};

export const cancelBooking = async (bookingId: number, profileId: number): Promise<Booking> => {
  const booking = await apiRequest('Cancellation', () => api.post<Booking>(`/bookings/${bookingId}/cancel`, profileId));
  if (!booking || typeof booking.id !== 'number' || typeof booking.status !== 'string') {
    throw new Error('The cancellation response was incomplete. Please refresh your bookings.');
  }
  return booking;
};
