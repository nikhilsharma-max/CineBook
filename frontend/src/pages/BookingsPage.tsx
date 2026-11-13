import { CalendarClock, MapPin, Ticket, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ActionButton, Spinner } from '../components/common/Loading';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { cancelBooking, getApiErrorMessage, getProfileBookings } from '../services/api';
import type { Booking } from '../types';
import { runWithMinimumLoading } from '../utils/action';

function BookingsPage() {
  const { profile } = useApp();
  const { notify } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const cancellationInFlightRef = useRef(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getProfileBookings(profile.id);
        console.log("Booking data"+data);
        setBookings(data);
      } catch (requestError: unknown) {
          console.log(requestError);
        setError(getApiErrorMessage(requestError, 'Unable to load bookings.'));
      } finally {
        setLoading(false);

      }
    };

    void loadBookings();
  }, [profile]);

  const handleCancel = async (bookingId: number) => {
    if (!profile) return;
    if (cancellationInFlightRef.current) return;
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    cancellationInFlightRef.current = true;
    setCancellingId(bookingId);
    try {
      const nextBooking = await runWithMinimumLoading('Cancellation', () => cancelBooking(bookingId, profile.id));
      setBookings((current) =>
        current.map((booking) => booking.id === bookingId ? nextBooking : booking),
      );
      notify('success', 'Booking cancelled successfully!');
    } catch (requestError: unknown) {
      notify('error', getApiErrorMessage(requestError, 'Unable to cancel this booking. Please try again.'));
    } finally {
      cancellationInFlightRef.current = false;
      setCancellingId(null);
    }
  };

  if (!profile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Please log in to view your bookings.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-[1px] shadow-xl shadow-violet-200">
        <div className="rounded-[30px] bg-white p-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">Account</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">My Bookings</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-9 w-9" label="Loading booking history" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          No bookings found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Ticket className="text-violet-600" size={18} />
                    <h2 className="text-xl font-bold text-slate-900">{booking.movieTitle}</h2>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2"><MapPin size={14} /> {booking.theatreName}</span>
                    <span className="inline-flex items-center gap-2"><CalendarClock size={14} /> {new Date(booking.bookedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                    booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {booking.status}
                  </span>
                  {booking.status === 'CONFIRMED' && (
                    <ActionButton
                      type="button"
                      onClick={() => void handleCancel(booking.id)}
                      loading={cancellingId === booking.id}
                      disabled={cancellingId !== null}
                      loadingLabel="Cancelling..."
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700"
                    >
                      <Trash2 size={14} />
                      Cancel
                    </ActionButton>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seats</p>
                  <p className="mt-2 text-base font-semibold text-slate-800">{booking.seatLabels.join(', ')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amount</p>
                  <p className="mt-2 text-base font-semibold text-slate-800">₹{booking.totalAmount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Booked by</p>
                  <p className="mt-2 text-base font-semibold text-slate-800">{booking.customerName}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
