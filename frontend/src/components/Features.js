"use client";

export default function Features() {
  const items = [
    {
      title: "Verified Professionals",
      description: "All providers are checked and approved by our team.",
      icon: "✔️",
    },
    {
      title: "Secure Booking",
      description: "Payments and information are protected.",
      icon: "🔒",
    },
    {
      title: "Real Reviews",
      description: "See honest feedback from real customers.",
      icon: "⭐",
    },
  ];
  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {items.map((i) => (
            <div key={i.title} className="text-center p-8 rounded-3xl bg-surface border border-border shadow-sm hover:shadow-md transition-all">
              <div className="text-5xl mb-6 flex justify-center">{i.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{i.title}</h3>
              <p className="text-text-muted leading-relaxed">{i.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
