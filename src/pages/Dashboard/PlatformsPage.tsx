import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Youtube, 
  Music2, 
  Instagram, 
  Globe, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  RefreshCw,
  Settings,
  Trash2,
  X,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { cn, formatCurrency } from "../../lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const PlatformsPage = () => {
  const { user, creatorProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const growthTips = [
    "Vídeos curtos (Reels/TikTok) com legendas em português têm tido 40% mais retenção em Angola este mês.",
    "Publicar entre as 18h e as 21h (hora de Luanda) aumenta o alcance orgânico em 25%.",
    "Responder aos primeiros 10 comentários nos primeiros 30 minutos melhora a entrega do algoritmo.",
    "Colaborações com outros criadores locais podem aumentar a tua base de seguidores em 15% num mês.",
    "Usar músicas angolanas que estão no top 10 do Spotify Angola ajuda a viralizar no TikTok."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % growthTips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const platforms = creatorProfile?.platforms || [];

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PLATFORM_AUTH_SUCCESS') {
        const { platform } = event.data;
        toast.success(`${platform.toUpperCase()} conectado com sucesso!`);
        setIsConnecting(false);
        // In a real app, you would refresh the platforms list here
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectPlatform = async (platformId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/auth/platforms/${platformId}/url?userId=${user.uid}`);
      if (!response.ok) throw new Error("Failed to get auth URL");
      
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        `Connect ${platformId}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error("Error connecting platform:", error);
      toast.error("Erro ao iniciar conexão com a plataforma.");
    }
  };

  const handleConnect = async (platformName: string) => {
    if (!creatorProfile) return;
    
    toast.info(`A conectar ao ${platformName}...`);
    setIsConnecting(false);

    try {
      const newPlatform = {
        id: platformName.toLowerCase(),
        name: platformName,
        status: "connected" as const,
        stats: { 
          subs: `${Math.floor(Math.random() * 100)}K`, 
          views: `${Math.floor(Math.random() * 500)}K`, 
          revenue: Math.floor(Math.random() * 50000) 
        },
        lastSync: "Agora"
      };

      const updatedPlatforms = [...platforms, newPlatform];
      await updateDoc(doc(db, "creator_profiles", creatorProfile.uid), {
        platforms: updatedPlatforms,
        updatedAt: new Date().toISOString()
      });

      toast.success(`${platformName} conectado com sucesso!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "creator_profiles/platforms");
      toast.error(`Erro ao conectar ao ${platformName}.`);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!creatorProfile) return;

    try {
      const updatedPlatforms = platforms.filter(p => p.id !== platformId);
      await updateDoc(doc(db, "creator_profiles", creatorProfile.uid), {
        platforms: updatedPlatforms,
        updatedAt: new Date().toISOString()
      });
      toast.success("Plataforma removida com sucesso.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "creator_profiles/platforms");
      toast.error("Erro ao remover plataforma.");
    }
  };

  const handleSync = async (platformId: string) => {
    if (!creatorProfile) return;
    setIsSyncing(platformId);
    
    try {
      const response = await fetch(`/api/platforms/sync?platformId=${platformId}`);
      if (!response.ok) throw new Error("Sync failed");
      
      const { stats, lastSync } = await response.json();
      
      const updatedPlatforms = platforms.map(p => {
        if (p.id === platformId) {
          return { ...p, stats, lastSync };
        }
        return p;
      });

      await updateDoc(doc(db, "creator_profiles", creatorProfile.uid), {
        platforms: updatedPlatforms,
        updatedAt: new Date().toISOString()
      });

      toast.success(`${platformId.toUpperCase()} sincronizado!`);
    } catch (error) {
      console.error("Error syncing platform:", error);
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setIsSyncing(null);
    }
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "youtube": return Youtube;
      case "tiktok": return Music2;
      case "instagram": return Instagram;
      case "facebook": return Globe;
      case "spotify": return Music2;
      case "twitch": return Globe;
      default: return Globe;
    }
  };

  const getColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "youtube": return "text-red-500";
      case "tiktok": return "text-white";
      case "instagram": return "text-pink-500";
      case "facebook": return "text-blue-500";
      case "spotify": return "text-green-500";
      case "twitch": return "text-purple-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Plataformas Conectadas</h1>
          <p className="text-muted">Gere as tuas integrações e vê o desempenho de cada rede social.</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => setIsConnecting(true)}>
          <Plus className="w-4 h-4" /> Conectar Nova
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platforms.map((platform, i) => {
              const Icon = getIcon(platform.name);
              const colorClass = getColor(platform.name);
              
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card glow className="glass-card overflow-hidden group">
                    <div className={cn("h-1 w-full", platform.status === "connected" ? "bg-verde" : platform.status === "pending" ? "bg-sol" : "bg-red-500")} />
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl bg-superficie border border-borda flex items-center justify-center shadow-card", colorClass)}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{platform.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {platform.status === "connected" && <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Conectado</Badge>}
                            {platform.status === "pending" && <Badge variant="sol" className="gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>}
                            {platform.status === "error" && <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Erro</Badge>}
                            <span className="text-[10px] text-muted uppercase font-mono tracking-wider">Sinc: {platform.lastSync}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-full hover:bg-terra/10 hover:text-terra", isSyncing === platform.id && "animate-spin")}
                          onClick={() => handleSync(platform.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleDisconnect(platform.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 pt-4">
                      {platform.status === "connected" && platform.stats ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-noite/50 border border-borda rounded-button">
                              <div className="flex items-center gap-2 text-muted mb-1">
                                <Users className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Seguidores</span>
                              </div>
                              <p className="text-xl font-mono font-bold">{platform.stats.subs}</p>
                            </div>
                            <div className="p-4 bg-noite/50 border border-borda rounded-button">
                              <div className="flex items-center gap-2 text-muted mb-1">
                                <Eye className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Views (Mês)</span>
                              </div>
                              <p className="text-xl font-mono font-bold">{platform.stats.views}</p>
                            </div>
                            <div className="p-4 bg-noite/50 border border-borda rounded-button">
                              <div className="flex items-center gap-2 text-muted mb-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Receita</span>
                              </div>
                              <p className="text-xl font-mono font-bold text-verde">{formatCurrency(platform.stats.revenue, "AOA")}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-sol" /> Top Conteúdo (Últimos 30 dias)
                            </h4>
                            <div className="space-y-2">
                              {[
                                { title: "Vlog em Luanda", views: "45K", likes: "12K", comments: "850" },
                                { title: "Dicas de Criatividade", views: "32K", likes: "8K", comments: "420" }
                              ].map((video, idx) => (
                                <div key={idx} className="p-3 bg-superficie border border-borda rounded-button flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-noite border border-borda flex items-center justify-center text-xs font-bold text-muted">
                                      IMG
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">{video.title}</p>
                                      <p className="text-[10px] text-muted uppercase">{video.views} views</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted">
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3 text-verde" /> {video.likes}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3 text-sol" /> {video.comments}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-sol/5 border border-sol/20 rounded-button mb-8 flex items-start gap-4">
                          <Clock className="w-6 h-6 text-sol shrink-0" />
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-sol">Verificação em Curso</p>
                            <p className="text-xs text-muted leading-relaxed">
                              Estamos a validar a tua conta de {platform.name}. Este processo pode demorar até 24 horas úteis.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <TrendingUp className="w-3 h-3 text-verde" />
                          <span>+5.2% crescimento este mês</span>
                        </div>
                        <Button variant="link" className="text-sol gap-1 h-auto p-0 text-xs">
                          Ver Analytics Detalhados <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Add Platform Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button 
                onClick={() => setIsConnecting(true)}
                className="w-full h-full min-h-[300px] border-2 border-dashed border-borda rounded-card flex flex-col items-center justify-center gap-4 hover:border-terra hover:bg-terra/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-superficie border border-borda flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-muted group-hover:text-terra" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">Adicionar Plataforma</h3>
                  <p className="text-sm text-muted">Conecta mais redes e aumenta a tua receita.</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Profile Improvement Sidebar */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Melhorar Perfil</CardTitle>
              <CardDescription>Dicas para atrair mais marcas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { title: "Bio Completa", status: true, tip: "A tua bio está excelente!" },
                  { title: "Nicho Definido", status: true, tip: "Foco em Tecnologia." },
                  { title: "Métricas Reais", status: false, tip: "Sincroniza o teu YouTube." },
                  { title: "Portfólio", status: false, tip: "Adiciona 3 trabalhos anteriores." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      item.status ? "bg-verde/20 text-verde" : "bg-sol/20 text-sol"
                    )}>
                      {item.status ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="gradient" className="w-full" onClick={() => navigate("/dashboard/definicoes")}>Optimizar Perfil</Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Tips e Gorjetas</CardTitle>
              <CardDescription>Gere a tua página de apoio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`/u/${creatorProfile?.uid}`, '_blank')}>
                <ExternalLink className="w-4 h-4" /> Ver Página Pública
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/dashboard/tips")}>
                <Settings className="w-4 h-4" /> Personalizar Página
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card bg-sol/5 border-sol/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sol" /> Dica de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentTipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-muted leading-relaxed"
                >
                  {growthTips[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {isConnecting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl glass-card overflow-hidden"
            >
              <div className="terra-gradient p-8 text-center relative">
                <button onClick={() => setIsConnecting(false)} className="absolute top-6 right-6 text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-3xl font-display font-bold">Conectar Plataforma</h3>
                <p className="text-white/80">Escolhe a rede social que queres integrar ao KREATOR.AO</p>
              </div>
              
                <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "youtube", name: "YouTube", icon: Youtube, color: "hover:text-red-500" },
                    { id: "tiktok", name: "TikTok", icon: Music2, color: "hover:text-white" },
                    { id: "instagram", name: "Instagram", icon: Instagram, color: "hover:text-pink-500" },
                    { id: "facebook", name: "Facebook", icon: Globe, color: "hover:text-blue-500" },
                    { id: "spotify", name: "Spotify", icon: Music2, color: "hover:text-green-500" },
                    { id: "twitch", name: "Twitch", icon: Globe, color: "hover:text-purple-500" }
                  ].map(p => (
                    <button
                      key={p.id}
                      disabled={platforms.some(pl => pl.id === p.id)}
                      onClick={() => handleConnectPlatform(p.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-button border border-borda bg-noite hover:border-terra transition-all group disabled:opacity-50 disabled:cursor-not-allowed",
                        p.color
                      )}
                    >
                      <p.icon className="w-10 h-10 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-bold">{p.name}</span>
                    </button>
                  ))}
                </div>

              <div className="p-8 bg-superficie border-t border-borda text-center">
                <p className="text-xs text-muted mb-4">
                  Ao conectar, autorizas o KREATOR.AO a aceder às tuas métricas de desempenho e dados de receita para fins de agregação e pagamento.
                </p>
                <Button variant="outline" onClick={() => setIsConnecting(false)}>Cancelar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
