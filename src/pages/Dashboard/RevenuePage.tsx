import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Calendar, 
  PieChart as PieChartIcon, 
  BarChart3, 
  CreditCard, 
  Wallet, 
  ChevronRight,
  Info,
  ExternalLink,
  Target,
  Zap,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useAuthStore } from "../../stores/useAuthStore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { Transaction } from "../../types";

export const RevenuePage = () => {
  const { user, creatorProfile, brandProfile, appUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "transactions");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const profile = appUser?.type === "creator" ? creatorProfile : brandProfile;
  const balance = profile?.balance || { aoa: 0, usd: 0 };

  const totalEarnings = transactions
    .filter(tx => tx.amount > 0 && tx.currency === "AOA")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const pendingEarnings = transactions
    .filter(tx => tx.status === "pending" && tx.amount > 0 && tx.currency === "AOA")
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Group by platform/type for pie chart
  const platformDataMap = transactions
    .filter(tx => tx.amount > 0 && tx.currency === "AOA")
    .reduce((acc, tx) => {
      const type = tx.type;
      acc[type] = (acc[type] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const platformRevenue = Object.entries(platformDataMap).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
    color: name === 'ad_revenue' ? '#FF0000' : name === 'tip' ? '#F5A623' : name === 'sponsorship' ? '#C1440E' : '#1E2240'
  }));

  // Group by month for bar chart
  const monthlyDataMap = transactions
    .filter(tx => tx.amount > 0 && tx.currency === "AOA")
    .reduce((acc, tx) => {
      const date = tx.date?.toDate ? tx.date.toDate() : new Date();
      const month = date.toLocaleString('pt-AO', { month: 'short' });
      acc[month] = (acc[month] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const monthlyRevenue = Object.entries(monthlyDataMap).map(([month, revenue]) => ({
    month,
    revenue
  })).slice(-4); // Last 4 months

  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Receitas & Ganhos</h1>
          <p className="text-muted">Análise detalhada da tua monetização agregada.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.info("Relatório PDF em processamento...")}>
            <Download className="w-4 h-4" /> Relatório PDF
          </Button>
          <Button variant="gradient" className="gap-2" onClick={() => navigate("/dashboard/wallet")}>
            <Wallet className="w-4 h-4" /> Levantar Saldo
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ganhos Totais", value: totalEarnings, trend: "+12.5%", icon: DollarSign, color: "text-sol" },
          { label: "Saldo Disponível", value: balance.aoa, trend: null, icon: Wallet, color: "text-verde" },
          { label: "Pendente", value: pendingEarnings, trend: null, icon: Clock, color: "text-muted" },
          { label: "Meta Mensal", value: 1500000, trend: "85%", icon: Target, color: "text-terra" }
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-xl bg-superficie border border-borda flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.trend && (
                  <Badge variant={stat.trend.startsWith("+") ? "success" : "outline"} className="h-5 text-[10px]">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">{stat.label}</p>
                <p className="text-2xl font-display font-bold">{formatCurrency(stat.value, "AOA")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Evolução de Receitas</CardTitle>
              <CardDescription>Ganhos mensais em 2026</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1"><Calendar className="w-3 h-3" /> 2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2240" vertical={false} />
                  <XAxis dataKey="month" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(193, 68, 14, 0.1)' }}
                    contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                    itemStyle={{ color: "#F0EDE8" }}
                  />
                  <Bar dataKey="revenue" fill="#C1440E" radius={[4, 4, 0, 0]} barSize={40}>
                    {monthlyRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === monthlyRevenue.length - 1 ? '#C1440E' : '#1E2240'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">Sem dados suficientes para o gráfico.</div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Fontes de Receita</CardTitle>
            <CardDescription>Distribuição por plataforma</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            {platformRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">Sem dados.</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8 px-8">
            {platformRevenue.map((item, i) => (
              <div key={i} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold">{item.name}</span>
                </div>
                <span className="text-xs font-mono text-muted">{formatCurrency(item.value, "AOA")}</span>
              </div>
            ))}
          </CardFooter>
        </Card>
      </div>

      {/* Revenue Optimization AI */}
      <Card className="bg-verde/5 border border-verde/20 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-verde/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-verde/20 flex items-center justify-center text-verde shrink-0">
            <Zap className="w-10 h-10" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-display font-bold text-verde">Optimiza os teus Ganhos com IA</h3>
            <p className="text-sm text-muted max-w-2xl leading-relaxed">
              Detectamos que as tuas Tips aumentaram 40% nos fins de semana. 
              Sugerimos activar o modo "Super Tip" aos Sábados para aumentar a tua receita média por fã.
            </p>
          </div>
          <Button variant="outline" className="border-verde/30 text-verde hover:bg-verde/10 px-8 h-12 shrink-0">
            Activar Sugestão
          </Button>
        </div>
      </Card>

      {/* Recent Earnings Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ganhos Recentes</CardTitle>
            <CardDescription>Últimas transacções de monetização</CardDescription>
          </div>
          <Button variant="ghost" className="text-sol gap-2">
            Ver Tudo <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-borda bg-superficie/50">
                  <th className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-muted">Data</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-muted">Fonte</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-muted">Descrição</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-muted">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-muted text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-muted">Carregando ganhos...</td>
                  </tr>
                ) : transactions.filter(tx => tx.amount > 0).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-muted">Nenhum ganho encontrado.</td>
                  </tr>
                ) : transactions.filter(tx => tx.amount > 0).map((row, i) => (
                  <tr key={i} className="hover:bg-superficie/30 transition-colors group">
                    <td className="px-8 py-4 text-sm font-mono text-muted">
                      {row.date?.toDate ? row.date.toDate().toLocaleDateString('pt-AO') : 'Pendente'}
                    </td>
                    <td className="px-8 py-4">
                      <Badge variant="outline" className="bg-noite uppercase">{row.type.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold">{row.description}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", row.status === "completed" ? "bg-verde" : "bg-sol")} />
                        <span className="text-xs capitalize">{row.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-right text-verde">
                      {formatCurrency(row.amount, row.currency as any)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
