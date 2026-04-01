import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  DollarSign, 
  Globe, 
  Heart, 
  Briefcase, 
  Package, 
  BarChart3, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  CreditCard
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../stores/useAuthStore";

const sidebarItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: DollarSign, label: "Receitas", path: "/dashboard/receitas" },
  { icon: Globe, label: "Plataformas", path: "/dashboard/plataformas" },
  { icon: Heart, label: "Propinas (Tips)", path: "/dashboard/tips" },
  { icon: Briefcase, label: "Marcas Parceiras", path: "/dashboard/marcas" },
  { icon: Package, label: "Produtos Digitais", path: "/dashboard/produtos" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Wallet, label: "Wallet & Pagamentos", path: "/dashboard/wallet" },
  { icon: CreditCard, label: "Planos & Preços", path: "/dashboard/precos" },
  { icon: Phone, label: "Contactos", path: "/dashboard/contactos" },
  { icon: Settings, label: "Configurações", path: "/dashboard/configuracoes" },
];

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, appUser, creatorProfile, brandProfile } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const notifications = [
    { id: 1, title: "Novo Pagamento", message: "Recebeste 15.000 Kz de uma Tip!", time: "Há 5 min", type: "payment" },
    { id: 2, title: "Campanha Aceite", message: "A Unitel aceitou a tua proposta.", time: "Há 2 horas", type: "campaign" },
    { id: 3, title: "Verificação KYC", message: "A tua identidade foi verificada com sucesso.", time: "Ontem", type: "security" },
  ];

  return (
    <div className="min-h-screen bg-noite flex">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-borda bg-superficie/50 backdrop-blur-xl transition-all duration-300 relative z-40",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="h-20 flex items-center px-6 mb-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 terra-gradient rounded-lg flex items-center justify-center font-display font-bold text-xl shrink-0">K</div>
            {!isCollapsed && (
              <span className="font-display font-bold text-xl tracking-tighter">KREATOR<span className="text-terra">.AO</span></span>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-3 h-12 rounded-button transition-all group relative",
                  isActive 
                    ? "bg-terra text-white shadow-button-glow" 
                    : "text-muted hover:bg-borda hover:text-texto"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-sol")} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-superficie border border-borda rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-borda">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 px-3 h-12 w-full rounded-button text-muted hover:bg-red-500/10 hover:text-red-500 transition-all group relative",
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-borda border border-borda rounded-full flex items-center justify-center hover:bg-terra transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-noite/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-superficie border-r border-borda z-50 md:hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 terra-gradient rounded-lg flex items-center justify-center font-display font-bold text-xl">K</div>
                  <span className="font-display font-bold text-xl tracking-tighter">KREATOR<span className="text-terra">.AO</span></span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-muted hover:text-texto">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-3 h-12 rounded-button transition-all",
                      location.pathname === item.path 
                        ? "bg-terra text-white" 
                        : "text-muted hover:bg-borda hover:text-texto"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-borda">
                <button onClick={handleLogout} className="flex items-center gap-4 px-3 h-12 w-full rounded-button text-muted hover:bg-red-500/10 hover:text-red-500">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Side Panel */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-noite/80 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 md:w-96 bg-superficie border-l border-borda z-[70] flex flex-col"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-borda">
                <h3 className="font-display font-bold text-xl">Notificações</h3>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 text-muted hover:text-texto">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 rounded-2xl bg-noite border border-borda hover:border-terra transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold group-hover:text-terra transition-colors">{notif.title}</h4>
                      <span className="text-[10px] text-muted uppercase font-mono">{notif.time}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-borda">
                <Button variant="outline" className="w-full" onClick={() => setIsNotificationsOpen(false)}>
                  Marcar todas como lidas
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-borda bg-noite/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-muted hover:text-texto"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3 px-4 h-10 bg-superficie border border-borda rounded-button w-64 md:w-96">
              <Search className="w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-muted hover:text-texto transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terra rounded-full border-2 border-noite" />
            </button>
            
            <div className="h-8 w-px bg-borda hidden sm:block" />

            <div className="relative group">
              <button className="flex items-center gap-3 pl-2 cursor-pointer">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold">{user?.email?.split('@')[0] || "Criador"}</span>
                  <Badge variant="sol" className="text-[10px] h-4">Verificado</Badge>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-terra p-0.5">
                  <div className="w-full h-full rounded-full bg-superficie flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-6 h-6 text-muted" />
                    )}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-superficie border border-borda rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-borda">
                    <div className="w-12 h-12 rounded-xl bg-noite border border-borda flex items-center justify-center overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-6 h-6 text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{user?.displayName || user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-noite transition-colors">
                      <span className="text-xs text-muted">Tipo de Conta</span>
                      <Badge variant="outline" className="capitalize">{appUser?.type || "Criador"}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-noite transition-colors">
                      <span className="text-xs text-muted">Saldo AOA</span>
                      <span className="text-xs font-bold text-verde">
                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(
                          appUser?.type === 'creator' ? creatorProfile?.balance?.aoa || 0 : brandProfile?.balance?.aoa || 0
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-borda space-y-1">
                    <Link to="/dashboard/configuracoes" className="flex items-center gap-3 p-2 rounded-lg hover:bg-noite transition-colors text-sm">
                      <Settings className="w-4 h-4 text-muted" />
                      Definições
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-500 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 kitenge-pattern">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
