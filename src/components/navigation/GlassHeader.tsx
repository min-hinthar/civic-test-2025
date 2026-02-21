'use client';

/**
 * GlassHeader -- Minimal glass-morphism header for public pages.
 *
 * Used on the landing page (showSignIn) and op-ed page (showBack).
 * No nav items -- just logo branding with an optional action button.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { FlagToggle } from '@/components/ui/FlagToggle';

interface GlassHeaderProps {
  /** Show "Sign In" button linking to /auth (landing page) */
  showSignIn?: boolean;
  /** Show "Back" button linking to backHref (op-ed page) */
  showBack?: boolean;
  /** Href for the back button (defaults to '/') */
  backHref?: string;
  /** Show heart icon linking to /about */
  showAbout?: boolean;
}

export function GlassHeader({ showSignIn, showBack, backHref = '/', showAbout }: GlassHeaderProps) {
  return (
    <header
      className="glass-medium prismatic-border glass-nav rounded-none sticky top-0 z-30 w-full"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="font-extrabold text-foreground text-sm hover:opacity-80 transition-opacity"
        >
          Civic Test Prep
        </Link>

        {/* Right-side action buttons */}
        <div className="flex items-center gap-2">
          <FlagToggle compact />

          {/* About heart icon — independent of other action buttons */}
          {showAbout && (
            <Link
              to="/about"
              className="flex items-center justify-center h-9 w-9 min-h-[44px] min-w-[44px] rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="About this app"
            >
              <Heart className="h-4 w-4" />
            </Link>
          )}

          {showSignIn && (
            <Link
              to="/auth"
              className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
            >
              Sign In
            </Link>
          )}

          {showBack && (
            <Link
              to={backHref}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
