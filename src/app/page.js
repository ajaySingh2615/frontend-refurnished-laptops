import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Quality Refurbished Laptops
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        Browse our collection of professionally refurbished laptops and
        accessories at unbeatable prices.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link href="/login">
          <Button size="lg">Get started</Button>
        </Link>
        <Link href="/about">
          <Button variant="outline" size="lg">
            Learn more
          </Button>
        </Link>
      </div>
    </main>
  );
}
