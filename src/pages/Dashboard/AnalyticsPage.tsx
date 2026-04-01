import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Smartphone, 
  Monitor, 
  Clock,
  MessageSquare,
  Smile,
  Meh,
  Frown,
  Info,
  ChevronRight,
  Download,
  Sparkles,
  X,
  Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { toast } from "sonner";
import { formatCurrency, cn } from "../../lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useAuthStore } from "../../stores/useAuthStore";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

const growthData = [
  { name: "Jan", followers: 45000, views: 120000 },
  { name: "Fev", followers: 52000, views: 145000 },
  { name: "Mar", followers: 61000, views: 180000 },
  { name: "Abr", followers: 75000, views: 210000 },
  { name: "Mai", followers: 88000, views: 250000 },
  { name: "Jun", followers: 105000, views: 320000 },
];

const audienceData = [
  { name: "18-24", value: 45 },
  { name: "25-34", value: 30 },
  { name: "35-44", value: 15 },
  { name: "45+", value: 10 },
];

const locationData = [
  { name: "Luanda", value: 65 },
  { name: "Benguela", value: 15 },
  { name: "Huambo", value: 10 },
  { name: "Outros", value: 10 },
];

const COLORS = ["#C1440E", "#F5A623", "#FF6B35", "#1E2240"];

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { creatorProfile, appUser } = useAuthStore();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const generateAIReport = async () => {
    if (!creatorProfile) return;

    if (creatorProfile.plan !== "premium") {
      toast.error("Relatórios Estratégicos com IA estão disponíveis apenas no plano Premium!", {
        action: {
          label: "Ver Planos",
          onClick: () => navigate("/dashboard/precos")
        }
      });
      return;
    }
    
    setIsGeneratingReport(true);
    toast.info("A gerar relatório estratégico com IA...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const stats = {
        followers: creatorProfile.stats.followers,
        views: creatorProfile.stats.views,
        likes: creatorProfile.stats.likes,
        balance: creatorProfile.balance,
        platforms: creatorProfile.platforms?.map(p => ({ name: p.name, subs: p.stats?.subs, views: p.stats?.views }))
      };

      const prompt = `
        Como um consultor de crescimento para criadores de conteúdo em Angola, analisa os seguintes dados e cria um relatório estratégico curto e impactante:
        Dados: ${JSON.stringify(stats)}
        
        O relatório deve incluir:
        1. Análise de desempenho actual.
        2. 3 sugestões práticas para aumentar o alcance em Angola.
        3. Oportunidades de monetização baseadas no nicho (Tecnologia/Criatividade).
        
        Usa um tom profissional, motivador e focado no mercado angolano. Formata em Markdown.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });

      setAiReport(response.text);
      setIsReportModalOpen(true);
    } catch (error) {
      console.error("Error generating AI report:", error);
      toast.error("Erro ao gerar relatório com IA.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const platformStats = useMemo(() => {
    if (!creatorProfile?.platforms) return [];
    return creatorProfile.platforms.map(p => ({
      name: p.name,
      followers: parseInt(p.stats?.subs.replace(/[^0-9]/g, '') || '0'),
      views: parseInt(p.stats?.views.replace(/[^0-9]/g, '') || '0'),
      revenue: p.stats?.revenue || 0
    }));
  }, [creatorProfile]);

  const totalFollowers = platformStats.reduce((acc, p) => acc + p.followers, 0);
  const totalViews = platformStats.reduce((acc, p) => acc + p.views, 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics Avançados</h1>
          <p className="text-muted">Visão agregada de todas as tuas plataformas com insights de IA.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.info("Relatório de analytics em processamento...")}>
            <Download className="w-4 h-4" /> Exportar Relatório
          </Button>
          <select className="bg-superficie border border-borda rounded-button px-4 h-10 text-sm outline-none focus:ring-1 focus:ring-sol">
            <option>Últimos 90 dias</option>
            <option>Últimos 30 dias</option>
            <option>Este ano</option>
          </select>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="terra-gradient p-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full kitenge-pattern opacity-10" />
        <div className="bg-noite rounded-card p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-terra/20 flex items-center justify-center text-terra shrink-0 animate-pulse-glow">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold">Insight da IA: O teu engajamento está a subir!</h3>
              <p className="text-sm text-muted max-w-xl">
                O teu conteúdo de "Educação" no TikTok está a converter 15% mais seguidores do que a média. 
                Sugerimos publicar mais 2 vídeos deste nicho por semana para maximizar o crescimento.
              </p>
            </div>
          </div>
          <Button 
            variant="gradient" 
            className="gap-2 px-8 h-12" 
            onClick={generateAIReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? "A Processar..." : "Ver Relatório Estratégico"} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-sol" />
              <Badge variant="success">+12%</Badge>
            </div>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Total Seguidores</p>
            <h4 className="text-2xl font-display font-bold">{totalFollowers.toLocaleString()}</h4>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-verde" />
              <Badge variant="success">+25%</Badge>
            </div>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Total Visualizações</p>
            <h4 className="text-2xl font-display font-bold">{totalViews.toLocaleString()}</h4>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-terra" />
              <Badge variant="success">8.5%</Badge>
            </div>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Taxa de Engajamento</p>
            <h4 className="text-2xl font-display font-bold">8.5%</h4>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-sol" />
              <Badge variant="outline">Global</Badge>
            </div>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Alcance Estimado</p>
            <h4 className="text-2xl font-display font-bold">{(totalFollowers * 1.5).toLocaleString()}</h4>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Crescimento de Audiência</CardTitle>
            <CardDescription>Seguidores e Visualizações agregadas</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C1440E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C1440E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2240" vertical={false} />
                <XAxis dataKey="name" stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#8B8FA8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                  itemStyle={{ color: "#F0EDE8" }}
                />
                <Area type="monotone" dataKey="followers" stroke="#C1440E" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
                <Area type="monotone" dataKey="views" stroke="#F5A623" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audience Demographics */}
        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Idade da Audiência</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {audienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#13162A", border: "1px solid #1E2240", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-4 justify-center pb-6">
              {audienceData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </CardFooter>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Localização (Angola)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {locationData.map((loc, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">{loc.name}</span>
                    <span className="text-muted">{loc.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-borda rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${loc.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full terra-gradient"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Analysis */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Análise de Sentimento</CardTitle>
            <CardDescription>O que dizem os teus fãs? (AI Analysis)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-around py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-verde/10 flex items-center justify-center text-verde mx-auto">
                  <Smile className="w-6 h-6" />
                </div>
                <p className="text-xl font-bold">72%</p>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Positivo</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-sol/10 flex items-center justify-center text-sol mx-auto">
                  <Meh className="w-6 h-6" />
                </div>
                <p className="text-xl font-bold">22%</p>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Neutro</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                  <Frown className="w-6 h-6" />
                </div>
                <p className="text-xl font-bold">6%</p>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Negativo</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Temas Recentes</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-verde/5 border-verde/20 text-verde">"Qualidade de som"</Badge>
                <Badge variant="outline" className="bg-verde/5 border-verde/20 text-verde">"Dicas úteis"</Badge>
                <Badge variant="outline" className="bg-sol/5 border-sol/20 text-sol">"Frequência de posts"</Badge>
                <Badge variant="outline" className="bg-red-500/5 border-red-500/20 text-red-500">"Áudio baixo"</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device & Platform Stats */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Dispositivos & Horários</CardTitle>
            <CardDescription>Quando e como a tua audiência te vê.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Dispositivos</p>
              <div className="space-y-4">
                {[
                  { icon: Smartphone, label: "Mobile", value: 85 },
                  { icon: Monitor, label: "Desktop", value: 12 },
                  { icon: Globe, label: "Outros", value: 3 }
                ].map((device, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-button bg-superficie border border-borda flex items-center justify-center text-muted">
                      <device.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold">{device.label}</span>
                        <span>{device.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-borda rounded-full overflow-hidden">
                        <div className="h-full terra-gradient" style={{ width: `${device.value}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Melhores Horários (GMT+1)</p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const hour = (i * 2);
                  const intensity = Math.random();
                  return (
                    <div key={i} className="space-y-1 text-center">
                      <div 
                        className="h-12 rounded-button border border-borda transition-all"
                        style={{ 
                          backgroundColor: `rgba(193, 68, 14, ${intensity})`,
                          borderColor: intensity > 0.5 ? '#C1440E' : '#1E2240'
                        }}
                      />
                      <span className="text-[8px] text-muted font-mono">{hour}h</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 p-3 bg-sol/5 border border-sol/20 rounded-button">
                <Clock className="w-4 h-4 text-sol" />
                <p className="text-[10px] text-muted leading-relaxed">
                  O teu pico de audiência é às <span className="text-sol font-bold">19:00 - 21:00</span>. 
                  Ideal para lives e posts importantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* AI Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl max-h-[80vh] glass-card overflow-hidden flex flex-col"
            >
              <div className="terra-gradient p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-sol" />
                  <h3 className="text-2xl font-display font-bold">Relatório Estratégico IA</h3>
                </div>
                <button onClick={() => setIsReportModalOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar bg-noite/50">
                <div className="markdown-body prose prose-invert max-w-none">
                  <Markdown>{aiReport}</Markdown>
                </div>
              </div>

              <div className="p-6 bg-superficie border-t border-borda flex justify-end gap-4 shrink-0">
                <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Fechar</Button>
                <Button variant="gradient" onClick={() => {
                  toast.success("Relatório guardado nos teus ficheiros!");
                  setIsReportModalOpen(false);
                }}>
                  Guardar PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
