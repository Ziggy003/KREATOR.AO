import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/Landing/LandingPage";
import { AuthPage } from "./pages/Auth/AuthPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardOverview } from "./pages/Dashboard/DashboardOverview";
import { WalletPage } from "./pages/Dashboard/WalletPage";
import { TipsPage } from "./pages/Dashboard/TipsPage";
import { MarketplacePage } from "./pages/Dashboard/MarketplacePage";
import { BrandsPage } from "./pages/Dashboard/BrandsPage";
import { PricingPage } from "./pages/Dashboard/PricingPage";
import { PlatformsPage } from "./pages/Dashboard/PlatformsPage";
import { AnalyticsPage } from "./pages/Dashboard/AnalyticsPage";
import { RevenuePage } from "./pages/Dashboard/RevenuePage";
import { ProductsPage } from "./pages/Dashboard/ProductsPage";
import { SettingsPage } from "./pages/Dashboard/SettingsPage";
import { ContactsPage } from "./pages/Dashboard/ContactsPage";
import { PublicTipPage } from "./pages/Tips/PublicTipPage";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/t/:username" element={<PublicTipPage />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="tips" element={<TipsPage />} />
            <Route path="marcas" element={<BrandsPage />} />
            <Route path="campanhas" element={<MarketplacePage />} />
            <Route path="precos" element={<PricingPage />} />
            <Route path="plataformas" element={<PlatformsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="receitas" element={<RevenuePage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="contactos" element={<ContactsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" expand={true} richColors />
    </QueryClientProvider>
  );
}
