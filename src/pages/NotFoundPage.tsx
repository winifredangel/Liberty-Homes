import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 bg-[#E8DED3]/60 text-[#795548] rounded-2xl flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#795548]">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717]">
          Cadastral Boundary Not Found
        </h1>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
          The page or property listing you are seeking does not exist or has been relocated to another sector.
        </p>
      </div>
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
