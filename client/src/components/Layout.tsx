import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/mcriap", label: "MCRiap" },
  { href: "/mio", label: "MIO" },
  { href: "/import", label: "Import" },
];

export default function Layout({ children }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-100 p-4">
        <nav className="flex gap-4">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={router.pathname === href ? "text-blue-600" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}