"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Compass,
  LifeBuoy,
  Users,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { GithubIcon } from "../icons/BrandIcons";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { signInWithGitHub } from "@/lib/auth/signIn";
import { createClient } from "@/lib/supabase/client";
import type { PrivateProfile } from "@/lib/types";

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string | null;
  name?: string | null;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as { profile: PrivateProfile };
        return {
          id: data.profile.id,
          username: data.profile.username,
          avatar_url: data.profile.avatar_url,
          name: data.profile.name,
        };
      }

      if (response.status === 401) return null;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return null;

      const metadata = authUser.user_metadata ?? {};
      return {
        id: authUser.id,
        username:
          typeof metadata.user_name === "string"
            ? metadata.user_name
            : "developer",
        avatar_url:
          typeof metadata.avatar_url === "string"
            ? metadata.avatar_url
            : null,
        name:
          typeof metadata.full_name === "string" ? metadata.full_name : null,
      };
    } catch (err) {
      console.error("Navbar profile load failed:", err);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    let active = true;

    resolveUser()
      .then((resolved) => {
        if (active) setUser(resolved);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN") {
        resolveUser().then((resolved) => {
          if (active) setUser(resolved);
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [resolveUser, supabase]);

  const handleSignIn = async () => {
    await signInWithGitHub(pathname || "/discover");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const navLinks = [
    { label: "Discover", href: "/discover", icon: <Compass size={17} /> },
    {
      label: "Contributor Rescue",
      href: "/rescue",
      icon: <LifeBuoy size={17} />,
    },
    { label: "Connections", href: "/connections", icon: <Users size={17} /> },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(241, 242, 250, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        paddingTop: "12px",
        paddingBottom: "12px",
      }}
    >
      <div className="container-max">
        <div
          style={{
            backgroundColor: "var(--dp-color-surface)",
            borderRadius: "var(--dp-radius-control)",
            boxShadow: "var(--clay-shadow-cream)",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--dp-color-accent)",
                boxShadow: "var(--clay-shadow-pill-pink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--dp-color-ink)",
              }}
            >
              <Sparkles size={18} strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--dp-typography-face)",
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--dp-color-ink)",
                letterSpacing: "-0.03em",
              }}
            >
              Glimi<span style={{ color: "var(--dp-color-accent)" }}>.</span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 18px",
                    borderRadius: "var(--dp-radius-control)",
                    fontSize: "var(--dp-typography-small)",
                    fontWeight: 700,
                    color: "var(--dp-color-ink)",
                    backgroundColor: isActive
                      ? "var(--dp-color-accent)"
                      : "transparent",
                    boxShadow: isActive
                      ? "var(--clay-shadow-pill-pink)"
                      : "none",
                    transition:
                      "transform var(--dp-motion-interaction) ease, box-shadow var(--dp-motion-interaction) ease",
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {loading ? (
              <div
                style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                className="shimmer-placeholder"
                aria-hidden="true"
              />
            ) : user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  href={`/profile/${user.username}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 14px 4px 6px",
                    borderRadius: "var(--dp-radius-control)",
                    backgroundColor: "#edeef6",
                    boxShadow: "var(--clay-shadow-recessed)",
                    textDecoration: "none",
                  }}
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.name || user.username}
                    size="sm"
                  />
                  <span
                    style={{
                      fontSize: "var(--dp-typography-small)",
                      fontWeight: 700,
                      color: "var(--dp-color-ink)",
                    }}
                  >
                    @{user.username}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  aria-label="Sign out"
                  title="Sign out"
                  style={{
                    background: "var(--dp-color-surface)",
                    border: "none",
                    color: "var(--dp-color-ink-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    boxShadow: "var(--clay-shadow-pill)",
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<GithubIcon size={16} />}
                onClick={() => void handleSignIn()}
              >
                Sign in with GitHub
              </Button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="mobile-menu-btn"
              style={{
                background: "var(--dp-color-surface)",
                border: "none",
                borderRadius: "50%",
                color: "var(--dp-color-ink)",
                cursor: "pointer",
                width: "40px",
                height: "40px",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--clay-shadow-pill)",
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            style={{
              backgroundColor: "var(--dp-color-surface)",
              borderRadius: "var(--dp-radius-surface)",
              boxShadow: "var(--clay-shadow-cream)",
              padding: "18px 24px",
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 18px",
                  borderRadius: "var(--dp-radius-control)",
                  fontSize: "var(--dp-typography-body)",
                  fontWeight: 700,
                  color: "var(--dp-color-ink)",
                  backgroundColor:
                    pathname === link.href
                      ? "var(--dp-color-accent)"
                      : "transparent",
                  boxShadow:
                    pathname === link.href
                      ? "var(--clay-shadow-pill-pink)"
                      : "none",
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            {user && (
              <Link
                href={`/profile/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 18px",
                  borderRadius: "var(--dp-radius-control)",
                  fontSize: "var(--dp-typography-body)",
                  fontWeight: 700,
                  color: "var(--dp-color-ink)",
                }}
              >
                <UserIcon size={18} />
                <span>My profile (@{user.username})</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
