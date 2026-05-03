import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { BottomNav } from "@/ui/shared/BottomNav";
import { useCatalogStore } from "@/ui/state/catalogStore";
import { useAuthStore } from "@/ui/state/authStore";
import { syncDeliveryAddressesWithUser } from "@/ui/state/deliveryStore";

const HIDE_NAV_PATHS = ["/register", "/welcome", "/login", "/register-auth", "/product", "/tracking", "/checkout"];

export function RootLayout() {
  const fetchBootstrap = useCatalogStore((s) => s.fetchBootstrap);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    void fetchBootstrap();
  }, [fetchBootstrap]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (accessToken && !user) {
        await fetchMe();
      }
      if (cancelled) return;
      const st = useAuthStore.getState();
      syncDeliveryAddressesWithUser(st.accessToken && st.user ? st.user.id : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, user, fetchMe]);

  const location = useLocation();
  const pathname = location.pathname;
  const hideNavDeepAddress =
    pathname === "/addresses/new" || /^\/addresses\/[^/]+\/edit$/.test(pathname);
  const hideNav =
    hideNavDeepAddress ||
    HIDE_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[var(--fresh-bg)] overflow-hidden">
      {/* Main Content Area */}
      <div
        className={`flex-1 min-h-0 relative ${
          location.pathname === "/stores" ? "overflow-hidden" : "overflow-y-auto"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Outlet />
      </div>

      {/* Persistent Navigation */}
      {!hideNav && (
        <div className="flex-none bg-white">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
