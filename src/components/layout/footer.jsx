import Link from "next/link";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Blog", href: "#" },
  ],
  shop: [
    { label: "Laptops", href: "#" },
    { label: "Accessories", href: "#" },
    { label: "Deals", href: "#" },
    { label: "Brands", href: "#" },
  ],
  support: [
    { label: "FAQ", href: "#" },
    { label: "Returns & Refunds", href: "#" },
    { label: "Warranty Policy", href: "#" },
    { label: "Shipping Info", href: "#" },
  ],
  connect: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h3 className="font-[family-name:var(--font-dm-sans)] text-base font-bold mb-3">
              Refurbished Laptops
            </h3>
            <p className="text-sm text-background/60 leading-relaxed">
              Gurugram&apos;s largest refurbished laptop store. Quality assured,
              warranty included.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-background/80">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/50 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} Refurbished Laptops. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-background/40">
            <Link href="#" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
