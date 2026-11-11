import { CalendarDays, MapPin, Ticket, UtensilsCrossed } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ActionButton, Spinner } from '../components/common/Loading';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, getShows, getShowSeats, getTheatres } from '../services/api';
import type { SeatMapItem, Show, Theatre } from '../types';

const seatLayout = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHOW_DATE_DISCOVERY_DAYS = 30;

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateText: string, days: number) => {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

function TheatresPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { city, profile } = useApp();
  const { notify } = useToast();
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [today] = useState(() => toDateInputValue(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [seatMap, setSeatMap] = useState<SeatMapItem[]>([]);
  const [loadingSeatsFor, setLoadingSeatsFor] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const movieId = searchParams.get('movieId');
  const showRequestId = useRef(0);
  const resumeBookingRef = useRef((location.state as {
    resumeBooking?: { show: Show; date: string; seatLabels: string[] };
  } | null)?.resumeBooking);

  useEffect(() => {
    const requestId = ++showRequestId.current;
    const resumeBooking = resumeBookingRef.current;
    const initialDate = resumeBooking?.date ?? today;
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        setShows([]);
        setSelectedDate(initialDate);
        const theatreData = await getTheatres(city);
        if (!active || requestId !== showRequestId.current) return;
        setTheatres(theatreData);

        const dates = resumeBooking
          ? [initialDate]
          : Array.from({ length: SHOW_DATE_DISCOVERY_DAYS + 1 }, (_, offset) => addDays(initialDate, offset));
        for (const date of dates) {
            const showData = await getShows(city, date);
            if (!active || requestId !== showRequestId.current) return;
            if (resumeBooking || showData.length > 0) {
              setSelectedDate(date);
              setShows(showData);

              if (resumeBooking) {
                const show = showData.find((candidate) => candidate.id === resumeBooking.show.id);
                if (show) {
                  setSelectedShow(show);
                  setLoadingSeatsFor(show.id);
                  try {
                    const seats = await getShowSeats(show.id);
                    if (!active || requestId !== showRequestId.current) return;
                    setSeatMap(seats);
                    setSelectedSeats(resumeBooking.seatLabels.filter((label) =>
                      seats.some((seat) => seat.seatLabel === label && !seat.reserved),
                    ));
                  } catch (seatError: unknown) {
                    if (active && requestId === showRequestId.current) {
                      notify('error', getApiErrorMessage(seatError, 'Unable to reload seat availability.'));
                    }
                  } finally {
                    if (active && requestId === showRequestId.current) {
                      setLoadingSeatsFor(null);
                    }
                  }
                } else {
                  notify('error', 'This show is no longer available. Please choose another show.');
                }
                resumeBookingRef.current = undefined;
                navigate(location.pathname + location.search, { replace: true, state: null });
              }
              return;
            }
          }
      } catch (requestError: unknown) {
        if (active && requestId === showRequestId.current) {
          const message = getApiErrorMessage(requestError, 'Unable to load theatres and showtimes from the backend.');
          if (resumeBooking) notify('error', message);
          else setError(message);
        }
      } finally {
        if (active && requestId === showRequestId.current) {
          setLoading(false);
        }
      }
    };

    void loadData();
    return () => {
      active = false;
    };
  }, [city, today, location.pathname, location.search, navigate, notify]);

  const handleDateChange = async (date: string) => {
    if (!date) return;

    setSelectedDate(date);
    setShows([]);
    setError('');
    setLoading(true);
    const requestId = ++showRequestId.current;

    try {
      const showData = await getShows(city, date);
      if (requestId === showRequestId.current) {
        setShows(showData);
      }
    } catch (requestError: unknown) {
      if (requestId === showRequestId.current) {
        setError(getApiErrorMessage(requestError, 'Unable to load showtimes for the selected date.'));
      }
    } finally {
      if (requestId === showRequestId.current) {
        setLoading(false);
      }
    }
  };

  const filteredShows = useMemo(() => {
    if (!movieId) return shows;
    return shows.filter((show) => show.movie.id.toString() === movieId);
  }, [movieId, shows]);

  const openSeatPicker = async (show: Show) => {
    if (loadingSeatsFor !== null) return;
    setSelectedShow(show);
    setSelectedSeats([]);
    setSeatMap([]);
    setLoadingSeatsFor(show.id);

    try {
      const seats = await getShowSeats(show.id);
      setSeatMap(seats);
      if (seats.every((seat) => seat.reserved)) {
        notify('info', 'No available seats.');
      }
    } catch (error: unknown) {
      notify('error', getApiErrorMessage(error, 'Unable to load seat availability.'));
    } finally {
      setLoadingSeatsFor(null);
    }
  };

  const handleSeatToggle = (seatLabel: string) => {
    if (!selectedShow) return;

    const selectedSeat = seatMap.find((seat) => seat.seatLabel === seatLabel);
    if (selectedSeat?.reserved) return;

    setSelectedSeats((current) => {
      if (current.includes(seatLabel)) {
        return current.filter((seat) => seat !== seatLabel);
      }
      if (current.length >= 8) {
        notify('info', 'You can select up to 8 seats per booking.');
        return current;
      }
      return [...current, seatLabel].sort();
    });
  };

  const handleContinueToPayment = () => {
    if (!selectedShow || !profile) {
      notify('info', 'Please log in before booking a seat.');
      return;
    }

    if (selectedSeats.length === 0) {
      notify('info', 'Please select at least one seat.');
      return;
    }
    if (selectedSeats.length > 8) {
      notify('info', 'You can select up to 8 seats per booking.');
      return;
    }

    notify('info', 'Opening mock payment page. No real payment will be processed.');
    navigate('/payment', {
      state: {
        booking: {
          show: selectedShow,
          showDate: selectedDate,
          seatLabels: [...selectedSeats],
          profileId: profile.id,
        },
      },
    });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[30px] bg-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-200">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">Cinemas</p>
            <h1 className="mt-2 text-3xl font-bold">Theatres in {city}</h1>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Show date
            <input
              type="date"
              value={selectedDate}
              min={today}
              disabled={loading}
              onChange={(event) => void handleDateChange(event.target.value)}
              className="rounded-xl border border-white/20 bg-white px-3 py-2 text-slate-900 disabled:opacity-60"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-9 w-9" label="Loading theatres and shows" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : filteredShows.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {movieId
              ? `No matching shows available for ${selectedDate} in ${city}.`
              : `No shows available for ${selectedDate} in ${city}.`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Choose another date to see available showtimes.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {theatres.map((theatre) => {
            const theatreShows = filteredShows.filter((show) => show.theatre.id === theatre.id);

            return (
              <article key={theatre.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{theatre.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2"><MapPin size={14} /> {theatre.city}</span>
                      <span className="inline-flex items-center gap-2"><UtensilsCrossed size={14} /> {theatre.address}</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                    <Ticket size={14} />
                    {theatreShows.length} show(s)
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {theatreShows.length > 0 ? (
                    theatreShows.map((show) => (
                      <div key={show.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{show.movie.title}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                            {show.availableSeats} seats left
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={14} />
                          {formatDate(show.startAt)}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">From</p>
                            <p className="text-xl font-bold text-slate-900">₹{show.ticketPrice}</p>
                          </div>
                          <ActionButton
                            type="button"
                            loading={loadingSeatsFor === show.id}
                            disabled={loadingSeatsFor !== null}
                            loadingLabel="Loading seats..."
                            onClick={() => void openSeatPicker(show)}
                            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Select seats
                          </ActionButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                      No shows for this theatre on {selectedDate}.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedShow && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-600">Seat selection</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedShow.movie.title}</h3>
              </div>
              <button type="button" disabled={loadingSeatsFor === selectedShow.id} onClick={() => setSelectedShow(null)} className="text-sm text-slate-500 disabled:opacity-50">
                Close
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-slate-100 p-4 text-center text-sm font-medium text-slate-700">
              Screen this side
            </div>

            {loadingSeatsFor === selectedShow.id ? (
              <div className="flex min-h-48 items-center justify-center">
                <Spinner className="h-8 w-8" label="Loading available seats" />
              </div>
            ) : seatMap.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">Seat availability is unavailable for this show.</p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {seatLayout.flatMap((row) =>
                  Array.from({ length: 6 }, (_, index) => {
                    const seatLabel = `${row}${index + 1}`;
                    const seat = seatMap.find((item) => item.seatLabel === seatLabel);
                    const selected = selectedSeats.includes(seatLabel);
                    const disabled = !seat || seat.reserved;

                    return (
                      <button
                        key={seatLabel}
                        type="button"
                        onClick={() => handleSeatToggle(seatLabel)}
                        disabled={disabled}
                        className={`flex h-11 items-center justify-center rounded-xl border text-xs font-semibold ${
                          disabled
                            ? 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400'
                            : selected
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                        }`}
                      >
                        {seatLabel}
                      </button>
                    );
                  }),
                )}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Selected seats</p>
                <p className="text-lg font-bold text-slate-900">{selectedSeats.length ? selectedSeats.join(', ') : 'None yet'}</p>
              </div>
              <ActionButton
                type="button"
                disabled={loadingSeatsFor === selectedShow.id}
                onClick={handleContinueToPayment}
                className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-violet-300"
              >
                Continue to payment
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TheatresPage;
