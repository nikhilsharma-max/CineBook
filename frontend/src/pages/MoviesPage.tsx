import { Clock3, Film, Search, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from '../components/common/Loading';
import { getApiErrorMessage, getMovies } from '../services/api';
import type { Movie } from '../types';
import { useNavigate } from 'react-router-dom';

const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

function MoviesPage() {
    const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
      } catch (requestError: unknown) {
        setError(getApiErrorMessage(requestError, 'Unable to fetch movies from the backend.'));
      } finally {
        setLoading(false);
      }
    };
    void loadMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movies;
    return movies.filter((movie) => movie.title.toLowerCase().includes(term));
  }, [movies, search]);

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[28px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-[1px] shadow-lg shadow-violet-200">
        <div className="rounded-[28px] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">Collection</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">All Movies</h1>
            </div>
            <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Search size={16} className="text-violet-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by movie title"
                className="w-full border-0 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-9 w-9" label="Loading movies" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : filteredMovies.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          No movies match your search.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMovies.map((movie) => (
            <article key={movie.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img src={movie.posterUrl} alt={movie.title} className="h-72 w-full object-cover" />
              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{movie.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{movie.genre}</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700">
                    {movie.certificate}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1"><Film size={12} /> {movie.language}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {formatDuration(movie.durationMinutes)}</span>
                  <span className="inline-flex items-center gap-1"><Tag size={12} /> {movie.genre}</span>
                </div>

                <p className="line-clamp-3 text-sm text-slate-600">{movie.description}</p>

                <div className="flex gap-2">
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Trailer
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate(`/theatres?movieId=${movie.id}`)}
                    className="flex-1 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >

                    Book now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MoviesPage;
