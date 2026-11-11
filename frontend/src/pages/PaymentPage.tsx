import {
  ArrowLeft,
  Building2,
  Check,
  CreditCard,
  Gift,
  Landmark,
  Smartphone,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ActionButton, Spinner } from '../components/common/Loading';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { createBooking, getApiErrorMessage, getShowSeats } from '../services/api';
import type { Booking, Show } from '../types';

type PaymentBooking = {
  show: Show;
  showDate: string;
  seatLabels: string[];
  profileId: number;
};

type PaymentRouteState = {
  booking?: PaymentBooking;
};

type PaymentMethod = 'UPI' | 'Debit/Credit Card' | 'Mobile Wallets' | 'Gift Voucher' | 'Net Banking' | 'Pay Later' | 'Redeem Points';
type PaymentStatus = 'ready' | 'processing-success' | 'processing-failure' | 'failed' | 'booking-error' | 'success';

const METHODS: { name: PaymentMethod; icon: typeof Smartphone }[] = [
  { name: 'UPI', icon: Smartphone },
  { name: 'Debit/Credit Card', icon: CreditCard },
  { name: 'Mobile Wallets', icon: Wallet },
  { name: 'Gift Voucher', icon: Gift },
  { name: 'Net Banking', icon: Landmark },
  { name: 'Pay Later', icon: Building2 },
  { name: 'Redeem Points', icon: Sparkles },
];

const DEMO_CONVENIENCE_FEE = 20;
const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function formatShowDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShowTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useApp();
  const { notify } = useToast();
  const bookingDetails = (location.state as PaymentRouteState | null)?.booking;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('ready');
  const [failureMessage, setFailureMessage] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [remainingSeats, setRemainingSeats] = useState<number | null>(null);
  const [voucher, setVoucher] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const attemptInFlight = useRef(false);
  const opened = useRef(false);
  const mounted = useRef(false);

  const subtotal = useMemo(() => {
    if (!bookingDetails || !bookingDetails.show || !Array.isArray(bookingDetails.seatLabels)) return 0;
    return Number(bookingDetails.show.ticketPrice) * bookingDetails.seatLabels.length;
  }, [bookingDetails]);
  const discount = voucherApplied ? Math.min(Math.round(subtotal * 0.1), 100) : 0;
  const payableAmount = Math.max(0, subtotal + DEMO_CONVENIENCE_FEE - discount);
  const detailsAreValid = Boolean(
    bookingDetails
    && bookingDetails.show
    && Number.isSafeInteger(bookingDetails.show.id)
    && bookingDetails.show.id > 0
    && bookingDetails.show.movie
    && bookingDetails.show.theatre
    && typeof bookingDetails.show.startAt === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(bookingDetails.showDate)
    && Number.isSafeInteger(bookingDetails.profileId)
    && bookingDetails.profileId > 0
    && Array.isArray(bookingDetails.seatLabels)
    && bookingDetails.seatLabels.length > 0
    && bookingDetails.seatLabels.length <= 8
    && bookingDetails.seatLabels.every((label) => typeof label === 'string' && label.trim().length > 0)
    && new Set(bookingDetails.seatLabels).size === bookingDetails.seatLabels.length
    && Number(bookingDetails.show.ticketPrice) >= 0
    && Number.isFinite(subtotal),
  );
  const isProcessing = paymentStatus === 'processing-success' || paymentStatus === 'processing-failure';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (import.meta.env.DEV) console.info('[CineBook] Payment page opened');
    notify('info', 'Simulation only — no real payment will be processed.');
  }, [notify]);

  const returnToSeats = () => {
    if (!bookingDetails) {
      navigate('/theatres');
      return;
    }

    navigate(`/theatres?movieId=${bookingDetails.show.movie.id}`, {
      state: {
        resumeBooking: {
          show: bookingDetails.show,
          date: bookingDetails.showDate,
          seatLabels: bookingDetails.seatLabels,
        },
      },
    });
  };

  const selectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (import.meta.env.DEV) console.info(`[CineBook] Selected payment method: ${method}`);
  };

  const startMockPayment = async (result: 'SUCCESS' | 'FAILURE') => {
    if (attemptInFlight.current || !detailsAreValid || !bookingDetails) return;

    attemptInFlight.current = true;
    setPaymentStatus(result === 'SUCCESS' ? 'processing-success' : 'processing-failure');
    setFailureMessage('');
    if (import.meta.env.DEV) console.info(`[CineBook] Mock payment started: ${result}`);

    try {
      await wait(result === 'SUCCESS' ? 2300 : 2000);
      if (!mounted.current) return;
      if (import.meta.env.DEV) console.info('[CineBook] Mock transaction completed');

      if (result === 'FAILURE') {
        setPaymentStatus('failed');
        notify('error', 'Payment failed. Please try again.');
        return;
      }

      const demoReference = `CB-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setTransactionReference(demoReference);
      notify('info', 'Mock payment simulation succeeded. Waiting for booking confirmation.');

      if (!profile || profile.id !== bookingDetails.profileId) {
        throw new Error('Your session has changed. Please return to seat selection and sign in again.');
      }

      if (import.meta.env.DEV) console.info('[CineBook] Booking API request started');
      let confirmedBooking: Booking;
      try {
        confirmedBooking = await createBooking(bookingDetails.show.id, {
          profileId: bookingDetails.profileId,
          seatLabels: bookingDetails.seatLabels,
        });
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error('[CineBook] Booking API request failed');
        setFailureMessage(
          `Payment simulation succeeded, but booking confirmation failed. Please try again. ${getApiErrorMessage(error, '')}`.trim(),
        );
        setPaymentStatus('booking-error');
        notify('error', getApiErrorMessage(error, 'Booking confirmation failed after the payment simulation.'));
        return;
      }

      setBooking(confirmedBooking);
      setPaymentStatus('success');
      notify('success', 'Tickets booked successfully!');
      if (import.meta.env.DEV) console.info('[CineBook] Booking confirmed');

      try {
        const seatAvailability = await getShowSeats(bookingDetails.show.id);
        if (mounted.current) {
          setRemainingSeats(seatAvailability.filter((seat) => !seat.reserved).length);
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.warn('[CineBook] Seat availability refresh failed after booking confirmation', error);
        }
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to complete the payment simulation.');
      setFailureMessage(message);
      setPaymentStatus('booking-error');
      notify('error', message);
    } finally {
      attemptInFlight.current = false;
    }
  };

  const applyVoucher = () => {
    if (voucher.trim().toUpperCase() === 'CINEDEMO10') {
      setVoucherApplied(true);
      notify('success', 'Demo offer applied.');
    } else {
      setVoucherApplied(false);
      notify('error', 'That demo offer code is not valid.');
    }
  };

  if (!detailsAreValid || !bookingDetails) {
    return (
      <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-rose-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Payment details unavailable</h1>
        <p className="mt-2 text-slate-600">Your seat selection was not found. Return to theatres and select a show again.</p>
        <button type="button" onClick={() => navigate('/theatres')} className="mt-6 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
          Return to theatres
        </button>
      </div>
    );
  }

  const { show, showDate, seatLabels } = bookingDetails;

  if (paymentStatus === 'success' && booking) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-36 md:pb-10">
        <section className="payment-success-enter overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 px-6 py-10 text-center text-white shadow-xl shadow-emerald-200 sm:px-10">
          <div className="success-check mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-emerald-600 shadow-lg">
            <Check size={42} strokeWidth={3} />
          </div>
          <h1 className="mt-5 text-3xl font-bold">Mock Payment Successful</h1>
          <p className="mt-2 text-white/90">Your tickets are confirmed!</p>
          <p className="mt-4 text-sm text-white/80">Demo transaction reference: {transactionReference}</p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <img src={show.movie.posterUrl} alt={show.movie.title} className="h-28 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Backend confirmed booking #{booking.id}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{show.movie.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{show.movie.language} · {show.movie.certificate}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cinema</p>
              <p className="mt-2 font-semibold text-slate-900">{show.theatre.name}</p>
              <p className="mt-1 text-sm text-slate-500">{show.theatre.address}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Showtime</p>
              <p className="mt-2 font-semibold text-slate-900">{formatShowDate(showDate)}</p>
              <p className="mt-1 text-sm text-slate-500">{formatShowTime(show.startAt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Seats</p>
              <p className="mt-2 font-semibold text-slate-900">{booking.seatLabels.join(', ')}</p>
              {remainingSeats !== null && <p className="mt-1 text-sm text-slate-500">{remainingSeats} seats remain</p>}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Simulated total</p>
              <p className="mt-2 text-xl font-bold text-slate-900">₹{payableAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-500">The backend booking total is ₹{booking.totalAmount}; no real payment was made.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Booking confirmed at</p>
              <p className="mt-2 font-semibold text-slate-900">{new Date(booking.bookedAt).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">Demo transaction reference — not a financial transaction</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/bookings/${booking.id}/confirmation`} state={{ booking }} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
              View Booking
            </Link>
            <Link to="/" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
              Back to Home
            </Link>
          </div>
        </section>
        <DemoPaymentControls status={paymentStatus} onSelect={startMockPayment} />
      </div>
    );
  }

  if (isProcessing) {
    const mockSuccess = paymentStatus === 'processing-success';
    return (
      <>
        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-5 rounded-[32px] border border-slate-200 bg-white px-6 text-center shadow-sm">
          <Spinner className="h-14 w-14" label="Processing mock payment" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{mockSuccess ? 'Processing your payment securely...' : 'Processing simulated payment...'}</h1>
            <p className="mt-2 text-slate-500">Demo only. No real payment details or money are involved.</p>
            {mockSuccess && <p className="mt-1 text-sm text-slate-500">Booking is confirmed only after the backend accepts your seats.</p>}
          </div>
        </div>
        <DemoPaymentControls status={paymentStatus} onSelect={startMockPayment} />
      </>
    );
  }

  if (paymentStatus === 'failed' || paymentStatus === 'booking-error') {
    const bookingFailure = paymentStatus === 'booking-error';
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 pb-40 text-center shadow-sm sm:p-10 sm:pb-40">
        <XCircle className="mx-auto h-14 w-14 text-rose-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{bookingFailure ? 'Booking could not be confirmed' : 'Payment failed. Please try again.'}</h1>
        <p className="mt-3 text-slate-600">
          {bookingFailure
            ? failureMessage || 'Payment simulation succeeded, but booking confirmation failed. Please try again.'
            : 'This failure was simulated. No booking was created and no seats were reserved.'}
        </p>
        {bookingFailure && transactionReference && (
          <p className="mt-3 text-xs text-slate-500">Demo transaction reference: {transactionReference} · Not a financial transaction</p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => { setPaymentStatus('ready'); setFailureMessage(''); }} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
            Try Again
          </button>
          <button type="button" onClick={returnToSeats} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Back to Seat Selection
          </button>
        </div>
        <DemoPaymentControls status={paymentStatus} onSelect={startMockPayment} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-44 md:pb-10">
      <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <button type="button" onClick={returnToSeats} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
          <ArrowLeft size={17} /> Back to seat selection
        </button>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">CineBook · Mock checkout</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Complete your booking</h1>
          </div>
          <p className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">DEMO ONLY · NO REAL PAYMENT</p>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h2 className="text-lg font-semibold text-slate-900">{show.movie.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{show.theatre.name} · {formatShowDate(showDate)} · {formatShowTime(show.startAt)}</p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">Choose a payment method</h2>
            <p className="mt-1 text-sm text-slate-500">All options below are visual demos only.</p>
          </div>
          <div className="grid sm:grid-cols-[13rem_minmax(0,1fr)]">
            <nav aria-label="Payment methods" className="flex overflow-x-auto border-b border-slate-100 p-2 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
              {METHODS.map(({ name, icon: Icon }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => selectMethod(name)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium transition sm:w-full ${
                    paymentMethod === name ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-current={paymentMethod === name ? 'page' : undefined}
                >
                  <Icon size={17} />
                  {name}
                </button>
              ))}
            </nav>

            <div key={paymentMethod} className="payment-panel-enter min-h-72 p-5 sm:p-6">
              <PaymentMethodContent
                method={paymentMethod}
                voucher={voucher}
                setVoucher={setVoucher}
                voucherApplied={voucherApplied}
                applyVoucher={applyVoucher}
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-5 py-4 text-white">
              <h2 className="font-bold">Order summary</h2>
              <p className="mt-1 text-xs text-slate-300">Review your tickets before the demo.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex gap-3">
                <img src={show.movie.posterUrl} alt={show.movie.title} className="h-24 w-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-slate-900">{show.movie.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{show.movie.language} · {show.movie.certificate}</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{show.theatre.name}</p>
                  <p className="text-xs text-slate-500">{show.theatre.address}</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
                <SummaryRow label="Show date" value={formatShowDate(showDate)} />
                <SummaryRow label="Showtime" value={formatShowTime(show.startAt)} />
                <SummaryRow label={`Tickets (${seatLabels.length})`} value={seatLabels.join(', ')} />
                <SummaryRow label={`Tickets · ₹${Number(show.ticketPrice).toFixed(2)} × ${seatLabels.length}`} value={`₹${subtotal.toFixed(2)}`} />
                <SummaryRow label="Demo convenience fee" value={`₹${DEMO_CONVENIENCE_FEE.toFixed(2)}`} />
                {discount > 0 && <SummaryRow label="Demo offer discount" value={`−₹${discount.toFixed(2)}`} />}
              </div>
              <div className="border-t border-slate-200 pt-4">
                <SummaryRow label="Simulated total payable" value={`₹${payableAmount.toFixed(2)}`} emphasized />
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  The demo fee/offer is not sent to Spring Boot. The backend records the actual ticket subtotal only.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-violet-100 bg-violet-50/70 p-4">
            <h3 className="text-sm font-bold text-slate-900">Apply Offers</h3>
            <div className="mt-3 flex gap-2">
              <input
                value={voucher}
                onChange={(event) => { setVoucher(event.target.value); setVoucherApplied(false); }}
                placeholder="Demo offer code"
                aria-label="Demo offer code"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
              <button type="button" onClick={applyVoucher} className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white">
                Apply
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Try CINEDEMO10 · display-only mock discount</p>
          </section>
        </aside>
      </div>

      <DemoPaymentControls status={paymentStatus} onSelect={startMockPayment} />
    </div>
  );
}

function DemoPaymentControls({
  status,
  onSelect,
}: {
  status: PaymentStatus;
  onSelect: (result: 'SUCCESS' | 'FAILURE') => void;
}) {
  const isProcessing = status === 'processing-success' || status === 'processing-failure';
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl shadow-slate-900/15">
      <h2 className="text-xs font-black tracking-[0.14em] text-slate-900">DEMO PAYMENT CONTROLS</h2>
      <p className="mt-1 text-xs text-slate-500">Simulation only — no real money involved.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ActionButton
          type="button"
          disabled={status === 'success' || isProcessing}
          loading={status === 'processing-success'}
          loadingLabel="Processing..."
          onClick={() => onSelect('SUCCESS')}
          className="min-h-11 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-bold text-white"
        >
          SUCCESS MOCK
        </ActionButton>
        <ActionButton
          type="button"
          disabled={status === 'success' || isProcessing}
          loading={status === 'processing-failure'}
          loadingLabel="Processing..."
          onClick={() => onSelect('FAILURE')}
          className="min-h-11 rounded-xl bg-rose-600 px-2 py-2 text-xs font-bold text-white"
        >
          FAILURE MOCK
        </ActionButton>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${emphasized ? 'text-base font-bold text-slate-900' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function PaymentMethodContent({
  method,
  voucher,
  setVoucher,
  voucherApplied,
  applyVoucher,
}: {
  method: PaymentMethod;
  voucher: string;
  setVoucher: (value: string) => void;
  voucherApplied: boolean;
  applyVoucher: () => void;
}) {
  const [demoSelection, setDemoSelection] = useState('');

  if (method === 'UPI') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">UPI · Simulation</h3>
        <p className="mt-1 text-sm text-slate-500">Choose any demo option. Nothing is scanned or charged.</p>
        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row">
          <div className="grid h-32 w-32 grid-cols-8 gap-0.5 rounded-lg border border-slate-200 bg-white p-2" aria-label="Decorative non-scannable demo QR">
            {Array.from({ length: 64 }, (_, index) => {
              const isDark = ((index * 17 + Math.floor(index / 8) * 11) % 7) < 3;
              return <span key={index} className={isDark ? 'bg-slate-900' : 'bg-white'} />;
            })}
          </div>
          <div>
            <p className="font-semibold text-slate-900">Decorative demo QR</p>
            <p className="mt-1 text-xs text-slate-500">Not scannable. Do not enter a UPI PIN.</p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">demo@cinebook.invalid</div>
          </div>
        </div>
        <DemoNotice />
      </div>
    );
  }

  if (method === 'Debit/Credit Card') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">Debit/Credit Card · Demo</h3>
        <p className="mt-1 text-sm text-slate-500">Fields below are disabled examples. Card data is not collected or sent.</p>
        <div className="mt-5 space-y-3">
          <DemoField label="Card number" value="DEMO •••• •••• •••• 4242" />
          <DemoField label="Cardholder name" value="DEMO CARDHOLDER" />
          <div className="grid grid-cols-2 gap-3">
            <DemoField label="Expiry date" value="MM / YY" />
            <DemoField label="CVV" value="DEMO" />
          </div>
        </div>
        <DemoNotice />
      </div>
    );
  }

  if (method === 'Mobile Wallets') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">Mobile Wallets</h3>
        <p className="mt-1 text-sm text-slate-500">Visual mock options only. No wallet app will open.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {['Paytm · Demo', 'PhonePe · Demo', 'Amazon Pay · Demo'].map((wallet) => (
            <button
              type="button"
              key={wallet}
              aria-pressed={demoSelection === wallet}
              onClick={() => setDemoSelection(wallet)}
              className={`rounded-2xl border p-4 text-center text-sm font-semibold transition ${
                demoSelection === wallet ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <Wallet className="mx-auto mb-2 text-violet-600" size={22} />{wallet}
            </button>
          ))}
        </div>
        {demoSelection && <p className="mt-3 text-sm text-violet-700">Selected {demoSelection}; this selection is not submitted.</p>}
        <DemoNotice />
      </div>
    );
  }

  if (method === 'Gift Voucher') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">Gift Voucher · Demo</h3>
        <p className="mt-1 text-sm text-slate-500">Enter the mock offer code from the order summary to apply a display-only discount.</p>
        <div className="mt-5 flex gap-2">
          <input
            value={voucher}
            onChange={(event) => setVoucher(event.target.value)}
            placeholder="CINEDEMO10"
            aria-label="Demo voucher code"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
          <button type="button" onClick={applyVoucher} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Apply</button>
        </div>
        {voucherApplied && <p className="mt-3 text-sm font-medium text-emerald-700">Demo voucher applied to the simulation total.</p>}
        <DemoNotice />
      </div>
    );
  }

  if (method === 'Net Banking') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">Net Banking · Demo</h3>
        <p className="mt-1 text-sm text-slate-500">Demo bank choices. No bank login details are requested.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {['Demo Bank One', 'Demo Bank Two', 'Demo Bank Three', 'Other demo bank'].map((bank) => (
            <button
              type="button"
              key={bank}
              aria-pressed={demoSelection === bank}
              onClick={() => setDemoSelection(bank)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium ${
                demoSelection === bank ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-700'
              }`}
            >
              <Landmark size={17} className="text-violet-600" />{bank}
            </button>
          ))}
        </div>
        {demoSelection && <p className="mt-3 text-sm text-violet-700">Selected {demoSelection}; this is a visual demo only.</p>}
        <DemoNotice />
      </div>
    );
  }

  if (method === 'Pay Later') {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-900">Pay Later · Simulation</h3>
        <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <p className="font-semibold text-slate-900">Demo deferred-payment option</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">This option only demonstrates the payment-method screen. No credit check, account, or repayment is created.</p>
          <button type="button" aria-pressed={demoSelection === 'Pay later demo'} onClick={() => setDemoSelection('Pay later demo')} className="mt-4 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700">
            {demoSelection === 'Pay later demo' ? 'Demo option selected' : 'Select demo option'}
          </button>
        </div>
        <DemoNotice />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">Redeem Points · Demo</h3>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-900">Mock rewards balance</p>
        <p className="mt-1 text-2xl font-bold text-amber-950">250 demo points</p>
        <p className="mt-2 text-sm text-amber-800">Points are illustrative only and are not linked to an account.</p>
        <button type="button" aria-pressed={demoSelection === 'Redeem demo points'} onClick={() => setDemoSelection('Redeem demo points')} className="mt-4 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900">
          {demoSelection === 'Redeem demo points' ? 'Demo points selected' : 'Select demo points'}
        </button>
      </div>
      <DemoNotice />
    </div>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-xs font-medium text-slate-500">
      {label}
      <input disabled value={value} readOnly className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
    </label>
  );
}

function DemoNotice() {
  return (
    <p className="mt-5 rounded-xl bg-violet-50 px-3 py-2.5 text-xs leading-relaxed text-violet-800">
      Demo payment interface only. Never enter payment credentials. Mock outcome is controlled by the DEMO PAYMENT CONTROLS.
    </p>
  );
}

export default PaymentPage;
