export type Movie = {
  id: number;
  title: string;
  language: string;
  genre: string;
  durationMinutes: number;
  certificate: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
};

export type Theatre = {
  id: number;
  name: string;
  city: string;
  address: string;
};

export type Show = {
  id: number;
  movie: Movie;
  theatre: Theatre;
  startAt: string;
  endAt: string;
  ticketPrice: number | string;
  totalSeats: number;
  availableSeats: number;
  availableSeatsLabels: string[];
};

export type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export type Booking = {
  id: number;
  showId: number;
  profileId: number;
  movieTitle: string;
  theatreName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seatLabels: string[];
  totalAmount: number | string;
  status: string;
  bookedAt: string;
};

export type CreateProfileInput = {
  name: string;
  email: string;
  phone: string;
};

export type SeatMapItem = {
  showId: number;
  seatLabel: string;
  reserved: boolean;
};
