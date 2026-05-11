import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "@/ui/layouts/RootLayout";
import { Onboarding } from "@/ui/screens/Onboarding";
import { RegistrationStub } from "@/ui/screens/RegistrationStub";
import { Addresses } from "@/ui/screens/Addresses";
import { AddressNewPage } from "@/ui/screens/address/AddressNewPage";
import { AddressEditPage } from "@/ui/screens/address/AddressEditPage";
import { Home } from "@/ui/screens/Home";
import { Catalog } from "@/ui/screens/Catalog";
import { Search } from "@/ui/screens/Search";
import { ProductDetails } from "@/ui/screens/ProductDetails";
import { Cart } from "@/ui/screens/Cart";
import { Checkout } from "@/ui/screens/Checkout";
import { Tracking } from "@/ui/screens/Tracking";
import { Orders } from "@/ui/screens/Orders";
import { Profile } from "@/ui/screens/Profile";
import { Favorites } from "@/ui/screens/Favorites";
import { SellerPage } from "@/ui/screens/SellerPage";
import { Stores } from "@/ui/screens/Stores";
import { Reviews } from "@/ui/screens/Reviews";
import { Login } from "@/ui/screens/Login";
import { Register } from "@/ui/screens/Register";
import { AdminLayout } from "@/ui/screens/admin/AdminLayout";
import { AdminDashboard } from "@/ui/screens/admin/AdminDashboard";
import { AdminUsers } from "@/ui/screens/admin/AdminUsers";
import { SellerCabinetAnalytics } from "@/ui/screens/seller-cabinet/SellerCabinetAnalytics";
import { SellerCabinetFinance } from "@/ui/screens/seller-cabinet/SellerCabinetFinance";
import { SellerCabinetLayout } from "@/ui/screens/seller-cabinet/SellerCabinetLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "welcome", Component: Onboarding },
      { path: "register", Component: RegistrationStub },
      { path: "addresses", Component: Addresses },
      { path: "addresses/new", Component: AddressNewPage },
      { path: "addresses/:addressId/edit", Component: AddressEditPage },
      { path: "home", Component: Home },
      { path: "catalog", Component: Catalog },
      { path: "search", Component: Search },
      { path: "product/:id", Component: ProductDetails },
      { path: "product/:id/reviews", Component: Reviews },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "tracking/:orderId", Component: Tracking },
      { path: "orders", Component: Orders },
      { path: "profile", Component: Profile },
      { path: "favorites", Component: Favorites },
      {
        path: "seller-cabinet",
        Component: SellerCabinetLayout,
        children: [
          { index: true, element: <Navigate to="analytics" replace /> },
          { path: "analytics", Component: SellerCabinetAnalytics },
          { path: "finance", Component: SellerCabinetFinance },
        ],
      },
      { path: "seller/:id", Component: SellerPage },
      { path: "stores", Component: Stores },
      { path: "login", Component: Login },
      { path: "register-auth", Component: Register },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
    ],
  },
]);
