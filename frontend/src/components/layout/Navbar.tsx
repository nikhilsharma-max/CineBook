import { CalendarDays, Film, Home, LogOut, MapPin, Search, Ticket, UserCircle2 } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from '../common/Loading';
import { CITY_OPTIONS, useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { createProfile, getApiErrorMessage, loginProfile } from '../../services/api';
import { runWithMinimumLoading } from '../../utils/action';
import type { Profile } from '../../types';

function Navbar() {
  const navigate = useNavigate();
  const { city, setCity, profile, setProfile, logout } = useApp();
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', identifier: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authSubmittingRef = useRef(false);
  const logoutInFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAuthOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) {
      navigate('/movies');
      return;
    }
    navigate(`/movies?search=${encodeURIComponent(trimmed)}`);
  };

  const validateAuthForm = () => {
    if (authMode === 'login') {
      if (!authForm.identifier.trim()) {
        return 'Enter your email address or phone number.';
      }
      return '';
    }

    const name = authForm.name.trim();
    const email = authForm.email.trim();
    const phone = authForm.phone.trim();
    const digitCount = phone.replace(/\D/g, '').length;

    if (!name || name.length > 100) {
      return 'Enter your name using 1 to 100 characters.';
    }
    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Enter a valid email address (maximum 100 characters).';
    }
    if (!/^[0-9+ ()-]{10,20}$/.test(phone) || digitCount < 10 || digitCount > 15) {
      return 'Enter a valid phone number with 10 to 15 digits.';
    }
    return '';
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authSubmittingRef.current) return;

    const validationMessage = validateAuthForm();
    if (validationMessage) {
      setAuthMessage(validationMessage);
      return;
    }

    setAuthMessage('');
    authSubmittingRef.current = true;
    setIsAuthSubmitting(true);
    try {
      let authenticatedProfile: Profile;

      if (authMode === 'register') {
        authenticatedProfile = await runWithMinimumLoading('Registration', () => createProfile({
          name: authForm.name.trim(),
          email: authForm.email.trim(),
          phone: authForm.phone.trim(),
        }));
      } else {
        authenticatedProfile = await runWithMinimumLoading('Login', () => loginProfile(authForm.identifier.trim()));
      }

      setProfile(authenticatedProfile);
      setAuthForm({ name: '', email: '', phone: '', identifier: '' });
      setIsAuthOpen(false);
      notify('success', authMode === 'register' ? 'Account created successfully!' : 'Logged in successfully!');
    } catch (error: unknown) {
      const fallback = authMode === 'register'
        ? 'Unable to create your account. Please try again.'
        : 'Unable to log in. Check your details and try again.';
      const message = getApiErrorMessage(error, fallback);
      setAuthMessage('');
      notify('error', message);
    } finally {
      authSubmittingRef.current = false;
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (logoutInFlightRef.current) return;
    logoutInFlightRef.current = true;
    setIsLoggingOut(true);
    try {
      await runWithMinimumLoading('Logout', async () => {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 2000);
        });
        localStorage.removeItem('cinebook-profile');
        logout();
      });
      notify('success', 'Logged out successfully!');
      navigate('/');
    } catch (error: unknown) {
      notify('error', error instanceof Error ? error.message : 'Unable to log out. Please try again.');
    } finally {
      logoutInFlightRef.current = false;
      setIsLoggingOut(false);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="CineBook home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-violet-200">
            <Ticket size={20} />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">CineBook</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Tickets</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: 'Home', to: '/', icon: Home },
            { label: 'Movies', to: '/movies', icon: Film },
            { label: 'Theatres', to: '/theatres', icon: MapPin },
            { label: 'My Bookings', to: '/bookings', icon: CalendarDays },
          ].map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <label className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:flex">
            <MapPin size={16} className="text-violet-600" />
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="bg-transparent pr-1 text-sm font-medium text-slate-700 outline-none"
            >
              {CITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
            <Search size={16} className="text-violet-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search movies"
              className="w-36 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </form>

          {profile ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <UserCircle2 size={18} className="text-violet-600" />
              <span className="hidden text-sm font-medium text-slate-700 md:inline">{profile.name}</span>
              <ActionButton
                type="button"
                onClick={() => void handleLogout()}
                loading={isLoggingOut}
                loadingLabel="Logging out..."
                className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Logout</span>
              </ActionButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {isAuthOpen && createPortal(
        <div className="auth-backdrop-enter fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="auth-modal-enter max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="auth-modal-title" className="text-xl font-semibold text-slate-900">Account</h3>
              <button type="button" disabled={isAuthSubmitting} onClick={() => setIsAuthOpen(false)} className="text-sm text-slate-500 disabled:cursor-not-allowed disabled:opacity-50">
                Close
              </button>
            </div>

            <div className="mb-4 flex rounded-full bg-slate-100 p-1 text-sm">
              <button
                type="button"
                disabled={isAuthSubmitting}
                onClick={() => setAuthMode('login')}
                className={`flex-1 rounded-full px-3 py-2 ${authMode === 'login' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600'}`}
              >
                Login
              </button>
              <button
                type="button"
                disabled={isAuthSubmitting}
                onClick={() => setAuthMode('register')}
                className={`flex-1 rounded-full px-3 py-2 ${authMode === 'register' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600'}`}
              >
                Register
              </button>
            </div>

            {authMode === 'register' ? (
              <form onSubmit={(event) => void handleAuthSubmit(event)} className="space-y-3">
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={authForm.name}
                  onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Full name"
                  disabled={isAuthSubmitting}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 disabled:bg-slate-50"
                />
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  required
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email address"
                  disabled={isAuthSubmitting}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 disabled:bg-slate-50"
                />
                <input
                  type="tel"
                  autoComplete="tel"
                  maxLength={20}
                  required
                  value={authForm.phone}
                  onChange={(event) => setAuthForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone number"
                  disabled={isAuthSubmitting}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 disabled:bg-slate-50"
                />
                <ActionButton
                  type="submit"
                  loading={isAuthSubmitting}
                  loadingLabel="Creating account..."
                  className="min-h-11 w-full rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  Create account
                </ActionButton>
              </form>
            ) : (
              <form onSubmit={(event) => void handleAuthSubmit(event)} className="space-y-3">
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={authForm.identifier}
                  onChange={(event) => setAuthForm((current) => ({ ...current, identifier: event.target.value }))}
                  placeholder="Email or phone"
                  disabled={isAuthSubmitting}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 disabled:bg-slate-50"
                />
                <ActionButton
                  type="submit"
                  loading={isAuthSubmitting}
                  loadingLabel="Logging in..."
                  className="min-h-11 w-full rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  Login
                </ActionButton>
              </form>
            )}

            {authMessage && <p className="mt-3 text-sm text-rose-600" role="alert">{authMessage}</p>}
          </div>
        </div>,
        document.body,
      )}
    </header>
    </>
  );
}

export default Navbar;
