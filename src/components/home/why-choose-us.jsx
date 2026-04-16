import { ShieldCheck, BadgeIndianRupee, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    description: "Every laptop undergoes a rigorous 40-point quality check before listing.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Unbeatable Prices",
    description: "Save up to 60% compared to brand-new laptops with the same specs.",
  },
  {
    icon: Truck,
    title: "Fast & Free Delivery",
    description: "Free shipping on orders above ₹5,000. Delivered within 3-5 business days.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Our tech team is available 6 days a week for any queries or issues.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center font-[family-name:var(--font-dm-sans)] text-xl font-bold sm:text-2xl">
          Why Thousands Trust Us
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
