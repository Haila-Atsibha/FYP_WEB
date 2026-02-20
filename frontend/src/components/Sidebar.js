"use client";

import Link from "next/link";

const menuByRole = {
  customer: [
    { label: "Dashboard", href: "/customer" },
    { label: "Bookings", href: "/customer/bookings" },
    { label: "Messages", href: "/customer/messages" },
  ],
  provider: [
    { label: "Dashboard", href: "/provider" },
    { label: "My Services", href: "/provider/services" },
    { label: "Bookings", href: "/provider/bookings" },
    { label: "Earnings", href: "/provider/earnings" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Pending Users", href: "/admin/pending" },
  ],
};

export default function Sidebar({ role }) {
  const links = menuByRole[role] || [];

  return (
    <aside className="w-60 bg-white shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-orange-600">Menu</h2>
        <ul className="mt-4 space-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block px-4 py-2 rounded-xl hover:bg-orange-50">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
