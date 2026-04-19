import { ShieldCheck, BadgeIndianRupee, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Quality assured",
    description: "Every laptop passes a rigorous 40-point inspection before listing.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Honest pricing",
    description: "Save up to 60% versus brand-new models with the same specs.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    description: "Free shipping on orders above ₹5,000, delivered in 3–5 business days.",
  },
  {
    icon: Headphones,
    title: "Real support",
    description: "Talk to our tech team six days a week for any question or issue.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-t border-border py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Why us
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built on trust, not on hype
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col bg-card p-6"
            >
              <feature.icon className="h-5 w-5 text-foreground" strokeWidth={1.6} />
              <h3 className="mt-5 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
