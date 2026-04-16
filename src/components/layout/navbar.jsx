"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Phone,
  Mail,
  Search,
  Menu,
  User,
  LayoutDashboard,
  MonitorSmartphone,
  LogOut,
  ShoppingBag,
  Laptop,
  Cable,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#", label: "Laptops", icon: Laptop },
  { href: "#", label: "Accessories", icon: Cable },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4">
          <span className="hidden sm:inline">
            Free delivery on orders above ₹5,000
          </span>
          <span className="sm:hidden text-[11px]">Free delivery above ₹5,000</span>
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">+91 98765 43210</span>
            </a>
            <a href="mailto:hello@refurbishedlaptops.in" className="hidden sm:flex items-center gap-1 hover:underline">
              <Mail className="h-3 w-3" />
              hello@refurbishedlaptops.in
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="lg:hidden p-1.5 -ml-1.5 text-foreground" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-[family-name:var(--font-dm-sans)] text-lg">
                  Refurbished Laptops
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {link.icon && <link.icon className="h-4 w-4 text-muted-foreground" />}
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 h-px bg-border" />

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/sessions"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                      Sessions
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full mt-2">Sign In</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="font-[family-name:var(--font-dm-sans)] text-lg font-bold tracking-tight text-primary whitespace-nowrap"
          >
            Refurbished Laptops
          </Link>

          {/* Search bar (placeholder) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search laptops, brands, accessories..."
                disabled
                className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="md:hidden p-1.5 text-muted-foreground hover:text-foreground" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <button className="p-1.5 text-muted-foreground hover:text-foreground relative" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
            </button>

            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {(user.name || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || user.phone}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/sessions" />} className="cursor-pointer">
                    <MonitorSmartphone className="mr-2 h-4 w-4" />
                    Sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="hidden sm:inline-flex">Sign In</Button>
                <User className="h-5 w-5 sm:hidden text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>

        {/* Desktop nav links row */}
        <nav className="hidden lg:block border-t">
          <div className="mx-auto flex h-10 max-w-7xl items-center gap-6 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
