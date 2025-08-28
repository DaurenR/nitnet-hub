import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RoleSwitch() {
  const [role, setRole] = useState<"support" | "manager">("support");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("role");
      if (stored === "support" || stored === "manager") {
        setRole(stored);
      }
    }
  }, []);

  const handleClick = (next: "support" | "manager") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("role", next);
      setRole(next);
      router.replace(router.asPath, undefined, { shallow: true });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        className={role === "support" ? "font-bold" : ""}
        onClick={() => handleClick("support")}
      >
        support
      </button>
      <button
        className={role === "manager" ? "font-bold" : ""}
        onClick={() => handleClick("manager")}
      >
        manager
      </button>
    </div>
  );
}
