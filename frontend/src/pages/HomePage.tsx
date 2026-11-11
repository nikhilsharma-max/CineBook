import { ArrowRight, Clock3, Film, PlayCircle, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/common/Loading';
import { useApp } from '../context/AppContext';
import { getApiErrorMessage, getMovies } from '../services/api';
import type { Movie } from '../types';

const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

function HomePage() {
  const navigate = useNavigate();
  const { city } = useApp();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
      } catch (requestError: unknown) {
        setError(getApiErrorMessage(requestError, 'Unable to load movies right now. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    void loadMovies();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-slate-950 via-slate-900 to-violet-900 px-6 py-8 text-white shadow-2xl shadow-violet-200/40 sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(217,70,239,0.35),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-100">
              <Film size={14} />
              Now showing in {city}
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Book your next cinema night with CineBook.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-200">
              Discover the latest blockbusters, handpicked showtimes, and easy seat selection using the live backend data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/movies')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Explore movies
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/theatres')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Browse theatres
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/40 p-4 backdrop-blur-md">
            <div className="grid gap-3 sm:grid-cols-2">
              {movies.slice(0, 4).map((movie) => (
                <div key={movie.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                  <img src={movie.posterUrl} alt={movie.title} className="h-44 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{movie.title}</p>
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-100">
                        {movie.certificate}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
                      <Clock3 size={12} />
                      {formatDuration(movie.durationMinutes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">Featured</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">Now Showing</h2>
          </div>
          <button type="button" onClick={() => navigate('/movies')} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
            View all <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Spinner className="h-9 w-9" label="Loading movies" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {movies.map((movie) => (
              <article key={movie.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative">
                  <img src={movie.posterUrl} alt={movie.title} className="h-80 w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {movie.language}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{movie.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{movie.genre}</p>
                    </div>
                    <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700">
                      {movie.certificate}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {formatDuration(movie.durationMinutes)}</span>
                    <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-400" /> 4.8</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/theatres?movieId=${movie.id}`)}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Book tickets
                    <PlayCircle size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
