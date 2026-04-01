import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  Users, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  Star,
  MessageSquare,
  Building2,
  Tag,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { cn, formatCurrency } from "../../lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy, where, getDoc, doc, updateDoc } from "firebase/firestore";
import { Campaign } from "../../types";

export const MarketplacePage = () => {
  const { user, appUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"available" | "active" | "history">("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [userApplications, setUserApplications] = useState<Record<string, any>>({});
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignApplications, setCampaignApplications] = useState<any[]>([]);
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, any>>({});
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    budget: 0,
    niche: "",
  });

  useEffect(() => {
    const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaignData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(campaignData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "campaigns");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || appUser?.type !== "creator") return;

    const q = query(
      collection(db, "campaign_applications"),
      where("creatorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        apps[data.campaignId] = { id: doc.id, ...data };
      });
      setUserApplications(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "campaign_applications");
    });

    return () => unsubscribe();
  }, [user, appUser]);

  const handleApply = async (campaign: Campaign) => {
    if (!user) return;
    if (userApplications[campaign.id!]) {
      toast.info("Já te candidataste a esta campanha.");
      return;
    }

    setIsApplying(campaign.id!);
    try {
      await addDoc(collection(db, "campaign_applications"), {
        campaignId: campaign.id,
        creatorId: user.uid,
        brandId: campaign.brandId,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      toast.success("Candidatura enviada com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "campaign_applications");
      toast.error("Erro ao enviar candidatura.");
    } finally {
      setIsApplying(null);
    }
  };

  const handleOpenApplications = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsAppsModalOpen(true);
    
    const q = query(
      collection(db, "campaign_applications"),
      where("campaignId", "==", campaign.id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaignApplications(apps);
      
      // Fetch creator profiles for these applications
      const uids = [...new Set(apps.map((a: any) => a.creatorId))];
      const profiles: Record<string, any> = { ...creatorProfiles };
      
      for (const uid of uids) {
        if (!profiles[uid]) {
          const profileDoc = await getDoc(doc(db, "creator_profiles", uid));
          if (profileDoc.exists()) {
            profiles[uid] = profileDoc.data();
          }
        }
      }
      setCreatorProfiles(profiles);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "campaign_applications");
    });

    return unsubscribe;
  };

  const handleUpdateAppStatus = async (appId: string, status: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "campaign_applications", appId), { status });
      toast.success(`Candidatura ${status === "accepted" ? "aceite" : "rejeitada"}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "campaign_applications");
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "campaigns"), {
        brandId: user.uid,
        title: newCampaign.title,
        description: newCampaign.description,
        budget: Number(newCampaign.budget),
        status: "active",
        createdAt: new Date().toISOString(),
      });
      toast.success("Campanha criada com sucesso!");
      setIsCreateModalOpen(false);
      setNewCampaign({ title: "", description: "", budget: 0, niche: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "campaigns");
      toast.error("Erro ao criar campanha.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Marketplace de Patrocínios</h1>
          <p className="text-muted">Encontra marcas angolanas e candidata-te a campanhas pagas.</p>
        </div>
        <div className="flex items-center gap-4">
          {appUser?.type === "brand" && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" /> Criar Campanha
            </Button>
          )}
          <div className="flex items-center gap-2 p-1 bg-superficie border border-borda rounded-button">
            <button 
              onClick={() => setActiveTab("available")}
              className={cn(
                "px-4 py-2 rounded-button text-sm font-bold transition-all",
                activeTab === "available" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
              )}
            >
              Disponíveis
            </button>
            <button 
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-4 py-2 rounded-button text-sm font-bold transition-all",
                activeTab === "active" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
              )}
            >
              Activas
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Creation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noite/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card p-8 relative"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-texto"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-display font-bold mb-6">Criar Nova Campanha</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Título da Campanha</label>
                  <Input 
                    required
                    placeholder="Ex: Lançamento de Verão"
                    value={newCampaign.title}
                    onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Descrição</label>
                  <textarea 
                    required
                    className="w-full bg-superficie border border-borda rounded-button p-4 text-sm outline-none focus:ring-1 focus:ring-sol min-h-[100px]"
                    placeholder="Detalhes da campanha e requisitos..."
                    value={newCampaign.description}
                    onChange={e => setNewCampaign({...newCampaign, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Orçamento (Kz)</label>
                  <Input 
                    required
                    type="number"
                    placeholder="Ex: 150000"
                    value={newCampaign.budget}
                    onChange={e => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                  />
                </div>
                <Button type="submit" variant="gradient" className="w-full h-12 mt-4">
                  Publicar Campanha
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Applications Modal */}
      <AnimatePresence>
        {isAppsModalOpen && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noite/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card p-8 relative max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsAppsModalOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-texto"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-display font-bold mb-2">Candidaturas</h2>
              <p className="text-muted mb-6">{selectedCampaign.title}</p>
              
              <div className="space-y-4">
                {campaignApplications.length === 0 ? (
                  <div className="text-center py-12 text-muted">Nenhuma candidatura recebida ainda.</div>
                ) : (
                  campaignApplications.map((app) => {
                    const profile = creatorProfiles[app.creatorId];
                    return (
                      <div key={app.id} className="p-4 rounded-button border border-borda bg-superficie/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-noite border border-borda flex items-center justify-center overflow-hidden">
                            {profile?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h4 className="font-bold">{profile?.name || "Carregando..."}</h4>
                            <p className="text-xs text-muted">{profile?.niche} • {profile?.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === "pending" ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-terra border-terra/50 hover:bg-terra/10"
                                onClick={() => handleUpdateAppStatus(app.id, "rejected")}
                              >
                                Rejeitar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="gradient"
                                onClick={() => handleUpdateAppStatus(app.id, "accepted")}
                              >
                                Aceitar
                              </Button>
                            </>
                          ) : (
                            <Badge variant={app.status === "accepted" ? "success" : "destructive"}>
                              {app.status === "accepted" ? "Aceite" : "Rejeitada"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input 
            placeholder="Pesquisar campanhas, marcas ou nichos..." 
            className="h-12 pl-12 bg-superficie"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 gap-2" onClick={() => toast.info("Filtros avançados em breve!")}>
          <Filter className="w-5 h-5" /> Filtros Avançados
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {campaigns
          .filter(c => searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glow className="glass-card overflow-hidden group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-noite border border-borda overflow-hidden p-2 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-sol" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-sol">Marca Verificada</span>
                        <Badge variant="success" className="h-4 text-[8px] uppercase">Verificada</Badge>
                      </div>
                      <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted uppercase font-bold tracking-widest mb-1">Orçamento</p>
                    <p className="text-2xl font-mono font-bold text-verde">{formatCurrency(campaign.budget, "AOA")}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6">
                <div className="p-4 bg-noite/50 border border-borda rounded-button">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sol" /> Descrição
                  </p>
                  <p className="text-sm text-muted leading-relaxed">{campaign.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>Criada em: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0 border-t border-borda bg-superficie/30">
                <div className="flex items-center justify-between w-full mt-6">
                  <Button variant="ghost" className="gap-2 text-muted hover:text-texto" onClick={() => toast.info("Funcionalidade de chat em breve!")}>
                    <MessageSquare className="w-4 h-4" /> Perguntar
                  </Button>
                  <Button 
                    variant={appUser?.type === "creator" ? (userApplications[campaign.id!] ? "outline" : "gradient") : "outline"} 
                    className="gap-2 px-8"
                    onClick={() => appUser?.type === "creator" ? handleApply(campaign) : handleOpenApplications(campaign)}
                    disabled={isApplying === campaign.id}
                  >
                    {appUser?.type === "creator" ? (
                      userApplications[campaign.id!] ? (
                        <>Candidatado <CheckCircle2 className="w-4 h-4" /></>
                      ) : isApplying === campaign.id ? (
                        "A enviar..."
                      ) : (
                        <>Candidatar-me <ArrowRight className="w-4 h-4" /></>
                      )
                    ) : (
                      <>Ver Candidaturas <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
