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
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((i) => (
            <div key={i.title} className="text-center p-6">
              <div className="text-5xl mb-4 text-orange-500">{i.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{i.title}</h3>
              <p className="text-gray-600">{i.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
