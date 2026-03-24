"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, LayoutDashboard, MessageSquare, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === "/";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">
            GymGenie
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-xs"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {/* Mobile menu */}
              <div className="md:hidden">
                <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent">
                    <Menu className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.href} className="cursor-pointer" onClick={() => { setMobileOpen(false); window.location.href = link.href; }}>
                        <link.icon className="mr-2 h-3.5 w-3.5" />
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setMobileOpen(false); logout(); }} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop user */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                      <span className="text-[10px] font-bold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => { window.location.href = "/profile"; }}>
                      <User className="mr-2 h-3.5 w-3.5" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : isLanding ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs">Sign up</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
