import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingsPage from './pages/BookingsPage';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import PaymentPage from './pages/PaymentPage';
import TheatresPage from './pages/TheatresPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/theatres" element={<TheatresPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:bookingId/confirmation" element={<BookingConfirmationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
