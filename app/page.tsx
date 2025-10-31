// app/landing/page.tsx
import React from "react";
import HeroClient from "@/components/landing/HeroClient";
import Link from "next/link";

export const metadata = {
  title: "BrewMaster — Cafe Manager",
  description:
    "BrewMaster helps cafe owners run smoother: track inventory, manage staff shifts, handle orders, and analyze sales — in one simple dashboard.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 font-gummy">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-md flex items-center justify-center text-white font-bold">
            BM
          </div>
          <span className="font-semibold text-4xl font-yellowtail">BrewMaster</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/landing#features" className="hover:underline">
            Features
          </Link>
          <Link href="/landing#pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/landing#testimonials" className="hover:underline">
            Customers
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100"
          >
            Log in
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
          >
            Get started
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Link
            href="/auth/sign-up"
            className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm"
          >
            Start
          </Link>
        </div>
      </header>

      <HeroClient />

      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Everything your café needs</h2>
        <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
          Manage orders, inventory, staff, and customers from one fast, focused interface. Built for
          independent cafes and multi-location groups.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="POS & Orders"
            desc="Fast, offline-capable POS that syncs orders across terminals and sends receipts instantly."
            emoji="🧾"
          />
          <FeatureCard
            title="Inventory & Suppliers"
            desc="Track stock levels, set reorder points, and generate supplier purchase orders automatically."
            emoji="📦"
          />
          <FeatureCard
            title="Team & Scheduling"
            desc="Create shifts, manage availability, approve timesheets and communicate with staff in-app."
            emoji="👥"
          />
          <FeatureCard
            title="Sales & Insights"
            desc="Daily reports, profit breakdown, popular items, and peak-hour heatmaps to optimize menus."
            emoji="📊"
          />
          <FeatureCard
            title="Loyalty & CRM"
            desc="Built-in loyalty program, coupons, and simple customer management to keep guests coming back."
            emoji="❤️"
          />
          <FeatureCard
            title="Integrations"
            desc="Connect printers, card readers, QuickBooks, and export data for accounting or BI tools."
            emoji="🔌"
          />
        </div>
      </section>

      <section id="pricing" className="bg-white border-t border-b py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold">Simple pricing that grows with you</h3>
          <p className="text-gray-600 mt-2">No hidden fees. Month-to-month. Annual discounts available.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard title="Starter" price="$29/mo" bullets={["1 location", "Basic POS", "Email support"]} />
            <PricingCard
              title="Growth"
              price="$79/mo"
              featured
              bullets={["Up to 5 locations", "Inventory & scheduling", "Priority support"]}
            />
            <PricingCard title="Enterprise" price="Contact" bullets={["Custom SLAs", "Migration support", "Dedicated success"]} />
          </div>
        </div>
      </section>

      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-center">Loved by cafe owners</h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Testimonial
            quote="BrewMaster cut our order errors in half and helped us find $3k in monthly savings."
            name="Sofia R."
            title="Owner, Little Oak Cafe"
          />
          <Testimonial
            quote="Shift scheduling actually became fun. My team loves the mobile shift swaps."
            name="Miguel P."
            title="Manager, Corner Brew"
          />
          <Testimonial
            quote="The inventory alerts are a lifesaver. Never out of oat milk again!"
            name="Ava L."
            title="Owner, Bean & Leaf"
          />
        </div>
      </section>

      <footer className="border-t py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} BrewMaster — Built for independent cafes.
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-600 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:underline">
              Privacy
            </Link>
            <Link href="/support" className="text-sm text-gray-600 hover:underline">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc, emoji }: { title: string; desc: string; emoji: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition">
      <div className="text-3xl">{emoji}</div>
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, bullets, featured = false }: { title: string; price: string; bullets: string[]; featured?: boolean }) {
  return (
    <div className={`p-6 rounded-lg ${featured ? "bg-amber-600 text-white shadow-lg" : "bg-white shadow-sm"}`}>
      <h4 className="text-xl font-semibold">{title}</h4>
      <div className="mt-4 text-2xl font-bold">{price}</div>
      <ul className={`mt-4 space-y-2 ${featured ? "text-amber-100" : "text-gray-600"}`}>
        {bullets.map((b) => (
          <li key={b} className="text-sm">• {b}</li>
        ))}
      </ul>
      <div className="mt-6">
        <Link
          href={featured ? "/auth/sign-up?plan=growth" : "/auth/sign-up"}
          className={`inline-block w-full text-center px-4 py-2 rounded ${featured ? "bg-white text-amber-600" : "bg-amber-600 text-white"}`}
        >
          Get started
        </Link>
      </div>
    </div>
  );
}

function Testimonial({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <blockquote className="p-6 bg-white rounded-lg shadow-sm">
      <p className="text-gray-700">“{quote}”</p>
      <footer className="mt-4 text-sm text-gray-600">
        <strong>{name}</strong> — <span>{title}</span>
      </footer>
    </blockquote>
  );
}
