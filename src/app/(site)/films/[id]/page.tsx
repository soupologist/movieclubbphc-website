// app/(site)/films/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type Credit = { title: string; names: string[] };
type Award = { title: string; details: string };

interface Film {
  _id: string;
  id: string;
  title: string;
  description?: string;
  date?: string;
  background?: string;
  backgroundImage?: string;
  embed?: string;
  generalCredits?: string[];
  credits: Credit[];
  awards: Award[];
  notes?: string;
  btsPhotos: string[];
}

const getInstagramId = (url: string) => {
  const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([a-zA-Z0-9_-]+)/);
  return match?.[1];
};

export default function FilmPage() {
  const { id } = useParams<{ id: string }>();
  const [film, setFilm] = useState<Film | null>(null);

  useEffect(() => {
    async function fetchFilm() {
      const res = await fetch(`/api/films/${id}`);
      if (!res.ok) return setFilm(null);
      const data = await res.json();
      setFilm(data);
    }

    fetchFilm();
  }, [id]);

  if (!film) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-gotham">
      {film.background ? (
        <video
          src={film.background.trim()}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <Image
          src={film.backgroundImage?.trim() || film.background?.trim() || '/fallback.jpg'}
          alt="Background"
          fill
          className="object-cover z-0"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />

      <div className="relative z-20 p-6 md:p-16 max-w-5xl mx-auto">
        <Link
          href="/films"
          className="inline-block mt-2 mb-8 px-5 py-2 border border-white text-white text-sm tracking-wide uppercase hover:bg-white hover:text-black transition"
        >
          GO BACK
        </Link>

        <h1 className="text-5xl md:text-7xl font-semibold mb-4">{film.title}</h1>

        {film.date && <p className="text-gray-400 italic text-lg mb-8">Released on {film.date}</p>}

        {film.description && (
          <div className="mt-12 md:mt-16 border-t border-gray-600 pt-6">
            <p className="text-xl text-gray-200">{film.description}</p>
          </div>
        )}

        {film.embed?.trim() && (
          <div className="mt-12 md:mt-16 aspect-video w-full">
            <iframe
              src={
                film.embed.includes('instagram.com')
                  ? `https://www.instagram.com/p/${getInstagramId(film.embed)}/embed`
                  : film.embed
              }
              className="w-full h-full rounded-xl"
              title="Embedded Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {film.credits?.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-4xl font-light text-blue-100 mb-4">Credits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              {film.credits.map((credit, i) => (
                <div key={i}>
                  <p className="text-lg text-gray-400 italic">{credit.title}</p>
                  <p className="text-lg text-gray-300">{credit.names?.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {film.awards?.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-4xl font-light text-yellow-100 mb-4">Awards</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {film.awards.map((a, i) => (
                <li key={i}>
                  <strong>{a.title}</strong> - {a.details}
                </li>
              ))}
            </ul>
          </div>
        )}

        {film.notes && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-4xl font-light text-green-200 mb-4">Production Notes</h2>
            <div className="mt-4 prose prose-invert prose-img:rounded-xl prose-a:text-blue-400 max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {Array.isArray(film.notes) ? film.notes.join('\n\n') : film.notes}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {film.btsPhotos?.length > 0 && film.btsPhotos[0] !== '' && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-4xl font-light text-pink-100 mb-4">Behind The Scenes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {film.btsPhotos.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`BTS ${i + 1}`}
                  width={400}
                  height={300}
                  className="rounded-xl w-full h-auto object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
