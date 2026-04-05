import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { 
  Heart, 
  Settings, 
  History, 
  Share2, 
  Copy, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Star,
  Gift,
  RefreshCw,
  Crown,
  Plus,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { formatCurrency, cn } from "../../lib/utils";
import { toast } from "sonner";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

interface Tip {
  id: string;
  sender: string;
  amount: number;
  message: string | null;
  createdAt: string;
  status: string;
}

export const TipsPage = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "subscriptions" | "settings">("overview");
  const { user, creatorProfile } = useAuthStore();
  const navigate = useNavigate();
  const username = user?.displayName?.toLowerCase().replace(/\s+/g, '') || "manewizzy";
  const tipLink = `kreator.ao/t/${username}`;
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("type", "==", "tip"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tip[];
      setTips(tipsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "transactions/tips");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalTips = tips.reduce((acc, tip) => acc + tip.amount, 0);
  const averageTip = tips.length > 0 ? totalTips / tips.length : 0;
  const recentTips = tips.slice(0, 5);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tipLink);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Apoia o meu conteúdo no KREATOR.AO',
        text: 'Clica no link para me enviares uma gorjeta e apoiares o meu trabalho!',
        url: `https://${tipLink}`,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tips & Gorjetas</h1>
          <p className="text-muted">Recebe apoio directo dos teus fãs angolanos e internacionais.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-superficie border border-borda rounded-button">
          <button 
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "overview" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "history" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <History className="w-4 h-4" /> Histórico
          </button>
          <button 
            onClick={() => setActiveTab("subscriptions")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all flex items-center gap-2 relative",
              activeTab === "subscriptions" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <RefreshCw className="w-4 h-4" /> Recorrentes
            <Badge variant="sol" className="absolute -top-2 -right-2 h-4 px-1 text-[8px] gap-0.5">
              <Crown className="w-2 h-2" /> PREMIUM
            </Badge>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "settings" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <Settings className="w-4 h-4" /> Definições
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Tip Link Card */}
          <Card className="terra-gradient p-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full kitenge-pattern opacity-10" />
            <div className="bg-noite rounded-card p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-terra/20 flex items-center justify-center text-terra">
                    <Heart className="w-6 h-6 fill-terra" />
                  </div>
                  <h3 className="text-2xl font-display font-bold">O teu Link de Tips</h3>
                </div>
                <p className="text-muted max-w-md">
                  Partilha este link na tua bio do TikTok, Instagram ou YouTube para começares a receber gorjetas.
                </p>
                <div className="flex items-center gap-2 p-2 bg-superficie border border-borda rounded-button max-w-sm mx-auto md:mx-0">
                  <span className="flex-1 px-3 text-sm font-mono text-sol truncate">{tipLink}</span>
                  <Button size="icon" variant="ghost" className="w-10 h-10 rounded-button" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="sol" className="w-10 h-10 rounded-button" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Button variant="gradient" className="gap-2 px-8 h-12" onClick={() => navigate(`/t/${username}`)}>
                  Ver Página Pública <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="gap-2 px-8 h-12" onClick={() => setActiveTab("settings")}>
                  Personalizar Página
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardContent className="p-6 space-y-2">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Total em Gorjetas</p>
                  <p className="text-3xl font-display font-bold text-verde">{formatCurrency(totalTips, "AOA")}</p>
                  <div className="flex items-center gap-2 text-xs text-verde">
                    <TrendingUp className="w-3 h-3" />
                    <span>{tips.length} gorjetas recebidas</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-6 space-y-2">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Média por Gorjeta</p>
                  <p className="text-3xl font-display font-bold">{formatCurrency(averageTip, "AOA")}</p>
                  <p className="text-xs text-muted">Baseado em {tips.length} gorjetas</p>
                </CardContent>
              </Card>
              <Card className="glass-card bg-sol/5 border-sol/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sol">
                    <Zap className="w-5 h-5" />
                    <p className="text-sm font-bold">Dica de Monetização</p>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Criadores que agradecem pessoalmente as gorjetas nos Stories aumentam a sua receita em média 35%.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tips List */}
            <Card className="lg:col-span-2 glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gorjetas Recentes</CardTitle>
                  <CardDescription>Últimas demonstrações de apoio dos teus fãs.</CardDescription>
                </div>
                <Button variant="ghost" className="text-sol text-xs font-bold uppercase tracking-widest">Ver Tudo</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-borda">
                  {recentTips.map((tip, i) => (
                    <motion.div 
                      key={tip.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 flex items-start gap-4 hover:bg-superficie/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-superficie border border-borda flex items-center justify-center text-muted shrink-0 group-hover:border-sol/50 transition-colors">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{tip.sender || "Anónimo"}</p>
                          <p className="text-lg font-mono font-bold text-verde">{formatCurrency(tip.amount, "AOA")}</p>
                        </div>
                        {tip.message && (
                          <div className="p-3 bg-noite/50 border border-borda rounded-button text-sm text-muted italic relative">
                            <MessageSquare className="absolute -top-2 -left-2 w-4 h-4 text-sol/50" />
                            "{tip.message}"
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-[10px] text-muted uppercase font-bold tracking-widest pt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(tip.createdAt).toLocaleDateString()}</span>
                          <span className={cn(
                            "flex items-center gap-1",
                            tip.status === "completed" ? "text-verde" : "text-sol"
                          )}>
                            <CheckCircle2 className="w-3 h-3" /> {tip.status === "completed" ? "Pago" : "Pendente"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="space-y-8">
          {creatorProfile?.plan !== "premium" ? (
            <Card className="p-12 text-center space-y-6 glass-card border-terra/30 bg-terra/5">
              <div className="w-20 h-20 rounded-full bg-terra/20 flex items-center justify-center text-terra mx-auto">
                <Crown className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-2xl font-display font-bold">Propinas Recorrentes Premium</h2>
                <p className="text-muted">
                  Permite que os teus fãs te apoiem mensalmente com subscrições exclusivas. 
                  Esta funcionalidade está disponível apenas para membros Premium.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gradient" size="lg" className="px-10" onClick={() => navigate("/dashboard/precos")}>
                  Actualizar para Premium
                </Button>
                <Button variant="outline" size="lg" onClick={() => setActiveTab("overview")}>
                  Voltar
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Os Meus Subscritores</CardTitle>
                      <CardDescription>Gere os teus fãs que te apoiam mensalmente.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Exportar Lista
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-y border-borda bg-superficie/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Fã</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Plano</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Valor Mensal</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Desde</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-borda">
                          {[
                            { name: "Carlos Silva", plan: "Apoiante Bronze", amount: 2500, date: "Jan 2024", status: "active" },
                            { name: "Maria J.", plan: "Apoiante Ouro", amount: 15000, date: "Fev 2024", status: "active" },
                            { name: "Anónimo #42", plan: "Apoiante Prata", amount: 5000, date: "Mar 2024", status: "active" },
                          ].map((sub, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-superficie border border-borda flex items-center justify-center text-muted">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-bold">{sub.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline">{sub.plan}</Badge>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-verde">
                                {formatCurrency(sub.amount, "AOA")}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted">
                                {sub.date}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="success">Activo</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Níveis de Subscrição</CardTitle>
                    <CardDescription>Configura os teus planos mensais.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "Apoiante Bronze", price: 2500, members: 12 },
                      { name: "Apoiante Prata", price: 5000, members: 5 },
                      { name: "Apoiante Ouro", price: 15000, members: 2 }
                    ].map((tier, i) => (
                      <div key={i} className="p-4 rounded-button border border-borda bg-noite/50 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">{tier.name}</p>
                          <p className="text-xs text-muted">{tier.members} membros</p>
                        </div>
                        <p className="text-sm font-mono font-bold text-sol">{formatCurrency(tier.price, "AOA")}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Nível
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-verde/5 border-verde/20">
                  <CardContent className="p-6 space-y-2">
                    <p className="text-xs text-muted uppercase font-bold tracking-widest">Receita Mensal Estimada (MRR)</p>
                    <p className="text-3xl font-display font-bold text-verde">{formatCurrency(125000, "AOA")}</p>
                    <p className="text-[10px] text-muted">Próximo pagamento: 05 de Abril</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Configuração da Página</CardTitle>
              <CardDescription>Personaliza como os teus fãs vêem a tua página de tips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Título da Página</label>
                <Input defaultValue="Apoia o meu conteúdo!" className="bg-superficie" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Mensagem de Agradecimento</label>
                <textarea 
                  className="w-full bg-superficie border border-borda rounded-button p-4 text-sm outline-none focus:ring-1 focus:ring-sol min-h-[100px]"
                  defaultValue="Muito obrigado pelo teu apoio! Ajuda-me imenso a continuar a criar conteúdo de qualidade para ti."
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Valores Sugeridos (AOA)</label>
                <div className="grid grid-cols-4 gap-2">
                  <Input defaultValue="500" className="bg-superficie text-center" />
                  <Input defaultValue="1000" className="bg-superficie text-center" />
                  <Input defaultValue="2500" className="bg-superficie text-center" />
                  <Input defaultValue="5000" className="bg-superficie text-center" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-superficie border border-borda rounded-button">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Permitir Mensagens</p>
                  <p className="text-xs text-muted">Os fãs podem escrever uma mensagem com a gorjeta.</p>
                </div>
                <div className="w-12 h-6 bg-verde rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button variant="gradient" className="w-full h-12">Guardar Alterações</Button>
            </CardFooter>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Metas de Gorjetas</CardTitle>
              <CardDescription>Cria metas visíveis para incentivar o apoio dos teus fãs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-6 bg-superficie border border-borda rounded-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sol/10 flex items-center justify-center text-sol">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Novo Microfone</p>
                      <p className="text-xs text-muted">Para melhorar a qualidade dos podcasts.</p>
                    </div>
                  </div>
                  <Badge variant="sol">Activa</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">Progresso: 65%</span>
                    <span className="text-muted">{formatCurrency(45000, "AOA")} / {formatCurrency(70000, "AOA")}</span>
                  </div>
                  <div className="h-2 w-full bg-noite rounded-full overflow-hidden">
                    <div className="h-full terra-gradient" style={{ width: "65%" }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-red-500">Remover</Button>
                </div>
              </div>

              <Button variant="outline" className="w-full border-dashed gap-2 h-12">
                <Plus className="w-4 h-4" /> Criar Nova Meta
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
