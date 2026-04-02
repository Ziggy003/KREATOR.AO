import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { 
  Building2, 
  Search, 
  Filter, 
  Globe, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare,
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export const BrandsPage = () => {
  const navigate = useNavigate();
  const { creatorProfile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const brands = [
    {
      id: "1",
      name: "Unitel",
      logo: "U",
      niche: "Telecomunicações",
      location: "Luanda, Angola",
      rating: 4.9,
      campaigns: 12,
      followers: "2.5M",
      verified: true,
      description: "A maior operadora de telecomunicações móveis em Angola, sempre à procura de criadores inovadores."
    },
    {
      id: "2",
      name: "Banco BAI",
      logo: "B",
      niche: "Finanças",
      location: "Luanda, Angola",
      rating: 4.8,
      campaigns: 8,
      followers: "850K",
      verified: true,
      description: "Líder no sector bancário angolano, focado em literacia financeira e inovação digital."
    },
    {
      id: "3",
      name: "Tigra",
      logo: "T",
      niche: "Bebidas",
      location: "Luanda, Angola",
      rating: 4.7,
      campaigns: 15,
      followers: "420K",
      verified: true,
      description: "A cerveja com garra. Procuramos criadores autênticos que representem o espírito de Angola."
    },
    {
      id: "4",
      name: "NCR Angola",
      logo: "N",
      niche: "Tecnologia",
      location: "Luanda, Angola",
      rating: 4.6,
      campaigns: 5,
      followers: "120K",
      verified: true,
      description: "Referência em tecnologia e informática. Ideal para criadores de reviews e tutoriais."
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Marcas Parceiras</h1>
          <p className="text-muted">Descobre as empresas que investem no talento angolano.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.info("Registo de marcas em breve!")}>
          Sou uma Marca <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input 
            placeholder="Pesquisar marcas por nome ou sector..." 
            className="h-12 pl-12 bg-superficie"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 gap-2">
          <Filter className="w-5 h-5" /> Sectores
        </Button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands
          .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.niche.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glow className="glass-card h-full flex flex-col group hover:border-sol/30 transition-all">
              <CardHeader className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-noite border border-borda flex items-center justify-center text-2xl font-bold text-sol shadow-card group-hover:scale-110 transition-transform">
                    {brand.logo}
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="success" className="gap-1 mb-2">
                      <CheckCircle2 className="w-3 h-3" /> Verificada
                    </Badge>
                    <div className="flex items-center gap-1 text-sol">
                      <Star className="w-3 h-3 fill-sol" />
                      <span className="text-xs font-bold">{brand.rating}</span>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl mb-1">{brand.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted">
                  {brand.niche} • {brand.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 flex-1">
                <p className="text-sm text-muted leading-relaxed mb-6">
                  {brand.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-noite/50 border border-borda rounded-button text-center">
                    <p className="text-[10px] uppercase font-bold text-muted mb-1">Campanhas</p>
                    <p className="text-lg font-mono font-bold flex items-center justify-center gap-2">
                      <Briefcase className="w-3 h-3 text-terra" /> {brand.campaigns}
                    </p>
                  </div>
                  <div className="p-3 bg-noite/50 border border-borda rounded-button text-center">
                    <p className="text-[10px] uppercase font-bold text-muted mb-1">Seguidores</p>
                    <p className="text-lg font-mono font-bold flex items-center justify-center gap-2">
                      <Users className="w-3 h-3 text-verde" /> {brand.followers}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-borda bg-superficie/30">
                <div className="flex items-center justify-between w-full mt-4">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-texto" onClick={() => toast.info("Perfil da marca em breve!")}>
                    Ver Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-sol/30 text-sol hover:bg-sol/10" 
                    onClick={() => {
                      if (creatorProfile?.plan !== "premium") {
                        toast.error("Contacto directo disponível apenas no plano Premium!", {
                          action: {
                            label: "Ver Planos",
                            onClick: () => navigate("/dashboard/precos")
                          }
                        });
                      } else {
                        toast.info("Chat com a marca em breve!");
                      }
                    }}
                  >
                    <MessageSquare className="w-4 h-4" /> Contactar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Brand CTA */}
      <Card className="glass-card bg-terra/5 border-terra/20">
        <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold">És uma Marca em Angola?</h3>
            <p className="text-muted">Acede a milhares de criadores qualificados e escala o teu marketing de influência.</p>
          </div>
          <Button variant="gradient" className="h-12 px-8">Começar a Recrutar</Button>
        </CardContent>
      </Card>
    </div>
  );
};
