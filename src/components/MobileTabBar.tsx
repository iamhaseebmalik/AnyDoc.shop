import { NavLink, useLocation } from "react-router-dom";
import { Home, ScanLine, History, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Editor", to: "/editor", icon: ScanLine },
  { label: "History", to: "/history", icon: History },
  { label: "Profile", to: "/profile", icon: UserRound },
];

export function MobileTabBar() {
  const { pathname } = useLocation();
  if (!tabs.some((tab) => tab.to === pathname)) return null;

  return (
    <nav aria-label="Mobile navigation" className="mobile-tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card sm:hidden">
      <div className="grid h-16 grid-cols-4 items-center px-2">
        {tabs.map(({ label, to, icon: Icon }) => (
          <Button key={to} variant="ghost" asChild className="h-14 min-w-0 rounded-md p-0 hover:bg-secondary">
            <NavLink to={to} end className={cn(
              "relative flex flex-col gap-1 text-[11px] font-medium motion-reduce:transition-none [&_svg]:size-5",
              pathname === to ? "bg-primary/10 text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground",
            )}>
              <Icon aria-hidden="true" strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          </Button>
        ))}
      </div>
    </nav>
  );
}