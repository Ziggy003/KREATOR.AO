import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  Users, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Youtube,
  Music2,
  Instagram,
  Globe,
  Plus,
  ExternalLink,
  Briefcase,
  Heart,
  Clock,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, cn } from "../../lib/utils";
import { useAuthStore } from "../../stores/useAuthStore";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { Transaction } from "../../types";

export const DashboardOverview = () => {
  const { user, appUser, creatorProfile, brandProfile } = useAuthStore();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);
  const [activeCreatorsCount, setActiveCreatorsCount] = useState(0);
  const [creatorActiveCampaignsCount, setCreatorActiveCampaignsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Recent Transactions
    const txQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(5)
    );

    const unsubscribeTxs = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setRecentTransactions(txs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "transactions");
      setIsLoading(false);
    });

    // Brand Specific Stats
    if (appUser?.type === "brand") {
      const campaignsQuery = query(
        collection(db, "campaigns"),
        where("brandId", "==", user.uid),
        where("status", "==", "active")
      );

      const unsubscribeCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
        setActiveCampaignsCount(snapshot.size);
      });

      const appsQuery = query(
        collection(db, "campaign_applications"),
        where("brandId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
        setActiveCreatorsCount(snapshot.size);
      });

      return () => {
        unsubscribeTxs();
        unsubscribeCampaigns();
        unsubscribeApps();
      };
    }

    // Creator Specific Stats
    if (appUser?.type === "creator") {
      const creatorAppsQuery = query(
        collection(db, "campaign_applications"),
        where("creatorId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const unsubscribeCreatorApps = onSnapshot(creatorAppsQuery, (snapshot) => {
        setCreatorActiveCampaignsCount(snapshot.size);
      });

      return () => {
        unsubscribeTxs();
        unsubscribeCreatorApps();
      };
    }

    return () => unsubscribeTxs();
  }, [user, appUser]);

  const isCreator = appUser?.type === "creator";
  const profile = isCreator ? creatorProfile : brandProfile;
  const profileName = isCreator ? creatorProfile?.name : brandProfile?.companyName;
  const balance = profile?.balance || { aoa: 0, usd: 0 };

  // Aggregate stats for creators
  const platforms = creatorProfile?.platforms || [];
  const totalFollowers = useMemo(() => platforms.reduce((acc, p) => {
    const subs = p.stats?.subs || "0";
    const num = parseFloat(subs.replace(/[KM]/g, '')) * (subs.includes('M') ? 1000000 : subs.includes('K') ? 1000 : 1);
    return acc + num;
  }, 0), [platforms]);

  const totalViews = useMemo(() => platforms.reduce((acc, p) => {
    const views = p.stats?.views || "0";
    const num = parseFloat(views.replace(/[KM]/g, '')) * (views.includes('M') ? 1000000 : views.includes('K') ? 1000 : 1);
    return acc + num;
  }, 0), [platforms]);

  const creatorKpis = [
    { label: "Saldo Disponível", value: balance.aoa, sub: "Pronto para levantar", icon: Wallet, trend: "up" },
    { label: "Visualizações", value: totalViews.toLocaleString(), sub: "Total acumulado", icon: Eye, trend: "up" },
    { label: "Seguidores", value: totalFollowers.toLocaleString(), sub: "Total acumulado", icon: Users, trend: "up" },
    { label: "Campanhas Activas", value: creatorActiveCampaignsCount.toString(), sub: "Em curso", icon: TrendingUp, trend: "up" }
  ];

  const brandKpis = [
    { label: "Saldo em Conta", value: balance.aoa, sub: "Para campanhas", icon: Wallet, trend: "up" },
    { label: "Alcance Total", value: "0", sub: "Das tuas campanhas", icon: Eye, trend: "up" },
    { label: "Criadores Activos", value: activeCreatorsCount.toString(), sub: "Em campanhas", icon: Users, trend: "up" },
    { label: "Campanhas Activas", value: activeCampaignsCount.toString(), sub: "Em curso", icon: Briefcase, trend: "up" }
  ];

  const kpis = isCreator ? creatorKpis : brandKpis;

  // Chart data from recent transactions (mocking some history if empty)
  const chartData = useMemo(() => {
    if (recentTransactions.length === 0) {
      return [
        { name: "01 Mar", revenue: 0 },
        { name: "05 Mar", revenue: 0 },
        { name: "10 Mar", revenue: 0 },
        { name: "15 Mar", revenue: 0 },
        { name: "20 Mar", revenue: 0 },
        { name: "25 Mar", revenue: 0 },
        { name: "30 Mar", revenue: 0 },
      ];
    }
    return recentTransactions
      .filter(tx => tx.amount > 0)
      .map(tx => ({
        name: tx.date?.toDate ? tx.date.toDate().toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }) : 'Pendente',
        revenue: tx.amount
      }))
      .reverse();
  }, [recentTransactions]);

  const platformData = useMemo(() => {
    if (!isCreator || platforms.length === 0) return [];
    return platforms.map(p => ({
      name: p.name,
      value: Math.floor(Math.random() * 50) + 10, // Mocking distribution for now
      color: p.name.toLowerCase() === "youtube" ? "#FF0000" : p.name.toLowerCase() === "tiktok" ? "#000000" : "#E1306C"
    }));
  }, [isCreator, platforms]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Bom dia, {profileName || "Utilizador"}!</h1>
          <p className="text-muted">Aqui está o resumo do teu desempenho hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          {isCreator ? (
            <>
              <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard/wallet")}>
                <DollarSign className="w-4 h-4" /> Levantar Fundos
              </Button>
              <Button variant="gradient" className="gap-2" onClick={() => navigate("/dashboard/produtos")}>
                <Plus className="w-4 h-4" /> Novo Produto
              </Button>
            </>
          ) : (
            <Button variant="gradient" className="gap-2" onClick={() => navigate("/dashboard/marketplace")}>
              <Plus className="w-4 h-4" /> Criar Campanha
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glow className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 terra-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-button bg-superficie border border-borda flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-sol" />
                  </div>
                  <Badge variant="success" className="gap-1"><ArrowUpRight className="w-3 h-3" /> Estável</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">{kpi.label}</p>
                  <h3 className="text-2xl font-mono font-bold">
                    {typeof kpi.value === "number" ? formatCurrency(kpi.value, "AOA") : kpi.value}
                  </h3>
                  <p className="text-xs text-muted">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isCreator ? "Evolução da Receita" : "Evolução do Investimento"}</CardTitle>
              <CardDescription>Desempenho recente baseado em transacções</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C1440E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C1440E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2240" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#8B8FA8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#8B8FA8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                  itemStyle={{ color: "#F0EDE8" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C1440E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{isCreator ? "Fontes de Receita" : "Canais de Investimento"}</CardTitle>
            <CardDescription>Distribuição por plataforma</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-between">
            <div className="h-[200px] w-full">
              {platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted">Sem dados.</div>
              )}
            </div>
            
            <div className="space-y-4">
              {platformData.map((platform, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }} />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold">{platform.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Actividade Recente</CardTitle>
            <CardDescription>Últimas transacções e eventos</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-borda">
              {isLoading ? (
                <div className="p-12 text-center text-muted">Carregando actividade...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="p-12 text-center text-muted">Nenhuma actividade recente.</div>
              ) : recentTransactions.map((activity, i) => {
                const isPositive = activity.amount > 0;
                const Icon = activity.type === "withdrawal" ? Wallet : activity.type === "tip" ? Heart : activity.type === "sponsorship" ? Briefcase : DollarSign;
                const colorClass = activity.type === "withdrawal" ? "text-sol" : isPositive ? "text-verde" : "text-terra";
                
                return (
                  <div key={i} className="flex items-start gap-4 p-6 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={cn("w-10 h-10 rounded-full bg-superficie flex items-center justify-center shrink-0 border border-borda", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold truncate">{activity.description}</h4>
                        <span className="text-[10px] text-muted uppercase font-mono">
                          {activity.date?.toDate ? activity.date.toDate().toLocaleDateString('pt-AO') : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-xs text-muted line-clamp-2">
                        {isPositive ? "Recebeste" : "Pagaste"} {formatCurrency(Math.abs(activity.amount), activity.currency as any)} • {activity.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-none border-t border-borda text-xs"
              onClick={() => navigate("/dashboard/wallet")}
            >
              Ver Todo o Histórico
            </Button>
          </CardContent>
        </Card>

        {/* Connected Platforms / Campaigns */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isCreator ? "Plataformas Conectadas" : "Campanhas Activas"}</CardTitle>
              <CardDescription>{isCreator ? "Estado das tuas integrações" : "Resumo das tuas campanhas em curso"}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(isCreator ? "/dashboard/plataformas" : "/dashboard/marketplace")}>
              <Plus className="w-4 h-4" /> {isCreator ? "Adicionar" : "Criar"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCreator ? (
              platforms.length > 0 ? (
                platforms.map((platform, i) => {
                  const Icon = platform.name.toLowerCase() === "youtube" ? Youtube : platform.name.toLowerCase() === "tiktok" ? Music2 : platform.name.toLowerCase() === "instagram" ? Instagram : Globe;
                  const colorClass = platform.name.toLowerCase() === "youtube" ? "text-red-500" : platform.name.toLowerCase() === "tiktok" ? "text-white" : platform.name.toLowerCase() === "instagram" ? "text-pink-500" : "text-blue-500";
                  
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-button border border-borda bg-noite/50 group hover:border-terra/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-button bg-superficie flex items-center justify-center", colorClass)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">{platform.name}</h4>
                          <p className="text-xs text-muted">{platform.stats?.subs} subs • {platform.stats?.views} views</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="success">Activo</Badge>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-borda rounded-button">
                  <p className="text-sm text-muted mb-4">Nenhuma plataforma conectada.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/plataformas")}>Conectar Agora</Button>
                </div>
              )
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-borda rounded-button">
                <p className="text-sm text-muted mb-4">Nenhuma campanha activa.</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/marketplace")}>Criar Primeira Campanha</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
