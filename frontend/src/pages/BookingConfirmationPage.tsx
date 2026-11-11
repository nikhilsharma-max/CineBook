import { CalendarCheck2, Home, MapPin, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Spinner } from '../components/common/Loading';
import { getApiErrorMessage, getBooking } from '../services/api';
import type { Booking } from '../types';

function BookingConfirmationPage() {
  const { bookingId: bookingIdParam } = useParams();
  const location = useLocation();
  const bookingId = Number(bookingIdParam);
  const stateBooking = (location.state as { booking?: Booking } | null)?.booking;
  const isBookingIdValid = Number.isSafeInteger(bookingId) && bookingId > 0;
  const hasStateBooking = stateBooking?.id === bookingId;
  const [booking, setBooking] = useState<Booking | null>(
    hasStateBooking ? stateBooking : null,
  );
  const [loading, setLoading] = useState(isBookingIdValid && !hasStateBooking);
  const [error, setError] = useState(isBookingIdValid ? '' : 'The booking reference is invalid.');

  useEffect(() => {
    if (hasStateBooking || !isBookingIdValid) return;

    let active = true;
    const loadBooking = async () => {
      try {
        const result = await getBooking(bookingId);
        if (active) setBooking(result);
      } catch (requestError: unknown) {
        if (active) setError(getApiErrorMessage(requestError, 'Unable to load booking details.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadBooking();
    return () => {
      active = false;
    };
  }, [bookingId, hasStateBooking, isBookingIdValid]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-[30px] border border-slate-200 bg-white">
          <Spinner className="h-9 w-9" label="Loading booking details" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700" role="alert">
          {error}
        </div>
      ) : booking ? (
        <>
          <section className="rounded-[30px] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 px-6 py-10 text-center text-white shadow-xl shadow-violet-200 sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <CalendarCheck2 size={32} />
            </div>
            <h1 className="mt-5 text-3xl font-bold">Booking confirmed</h1>
            <p className="mt-2 text-white/85">Your tickets are ready. Enjoy the show!</p>
            <p className="mt-4 text-sm text-white/80">Booking reference #{booking.id}</p>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <Ticket className="mt-1 text-violet-600" size={22} />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{booking.movieTitle}</h2>
                <p className="mt-1 inline-flex items-center gap-2 text-slate-500">
                  <MapPin size={15} /> {booking.theatreName}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Seats</p>
                <p className="mt-2 font-semibold text-slate-900">{booking.seatLabels.join(', ')}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total paid</p>
                <p className="mt-2 font-semibold text-slate-900">₹{booking.totalAmount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Booking status</p>
                <p className="mt-2 font-semibold text-emerald-700">{booking.status}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Booked at</p>
                <p className="mt-2 font-semibold text-slate-900">{new Date(booking.bookedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/bookings" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
                My bookings
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
                <Home size={16} /> Home
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default BookingConfirmationPage;
