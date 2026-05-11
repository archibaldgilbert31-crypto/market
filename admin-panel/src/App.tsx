import { Routes, Route, Navigate, Outlet } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { SellerLayout } from "./pages/SellerLayout";
import { ProductsPage } from "./pages/ProductsPage";
import { CategoryEditPage } from "./pages/CategoryEditPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { FinancePage } from "./pages/FinancePage";
import { SELLER_ADMIN_TOKEN_KEY } from "./api";

function SellerGate() {
  const t = localStorage.getItem(SELLER_ADMIN_TOKEN_KEY);
  if (!t) return <Navigate to="/login" replace />;
  return (
    <SellerLayout>
      <Outlet />
    </SellerLayout>
  );
}

export function App() {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<SellerGate />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="edit-categories" element={<CategoryEditPage />} />
          <Route path="categories" element={<Navigate to="/edit-categories" replace />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="finance" element={<FinancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
