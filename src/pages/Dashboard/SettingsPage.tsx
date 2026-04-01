import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  LogOut, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Smartphone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const SettingsPage = () => {
  const { user, appUser, creatorProfile, brandProfile, logout } = useAuthStore();
  const profile = creatorProfile || brandProfile;
  const [activeSection, setActiveSection] = useState<"profile" | "account" | "notifications" | "security">("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: creatorProfile?.bio || "",
    location: creatorProfile?.location || brandProfile?.location || "",
    website: brandProfile?.website || ""
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const profileCollection = appUser?.type === "creator" ? "creator_profiles" : "brand_profiles";
      const profileDocRef = doc(db, profileCollection, user.uid);
      
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (appUser?.type === "creator") {
        updateData.name = formData.displayName;
        updateData.bio = formData.bio;
        updateData.location = formData.location;
      } else {
        updateData.companyName = formData.displayName;
        updateData.location = formData.location;
        updateData.website = formData.website;
      }

      await updateDoc(profileDocRef, updateData);
      toast.success("Definições actualizadas com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `profiles/${user.uid}`);
      toast.error("Erro ao guardar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: "profile", label: "Perfil Público", icon: User },
    { id: "account", label: "Conta & Pagamentos", icon: CreditCard },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Definições</h1>
        <p className="text-muted">Gere a tua conta, perfil e preferências de segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-bold transition-all",
                activeSection === section.id 
                  ? "bg-terra text-white shadow-button-glow" 
                  : "text-muted hover:text-texto hover:bg-superficie"
              )}
            >
              <section.icon className="w-5 h-5" />
              {section.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-borda">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Terminar Sessão
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeSection === "profile" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Informação do Perfil</CardTitle>
                  <CardDescription>Como os outros te vêem na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Avatar Upload */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-noite border-2 border-borda overflow-hidden flex items-center justify-center">
                        <img 
                          src={user?.photoURL || "https://picsum.photos/seed/avatar/200/200"} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-sol text-noite flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h3 className="text-xl font-bold">{user?.displayName}</h3>
                      <p className="text-sm text-muted">Recomendado: 400x400px. Máximo 2MB.</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <Button variant="outline" size="sm">Alterar Foto</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Remover</Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Nome de Exibição</label>
                      <Input 
                        value={formData.displayName} 
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="bg-superficie" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Username (@)</label>
                      <Input defaultValue="manewizzy" className="bg-superficie" disabled />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Bio</label>
                      <textarea 
                        className="w-full bg-superficie border border-borda rounded-button p-4 text-sm outline-none focus:ring-1 focus:ring-sol min-h-[100px]"
                        placeholder="Escreve um pouco sobre ti..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Localização</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input 
                          value={formData.location} 
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="bg-superficie pl-10" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Website / Linktree</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input 
                          value={formData.website} 
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="bg-superficie pl-10" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-end">
                  <Button 
                    variant="gradient" 
                    className="gap-2 px-8 h-12" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" /> {isSaving ? "A guardar..." : "Guardar Alterações"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Verification Status */}
              <Card className="bg-sol/5 border border-sol/20 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sol/10 flex items-center justify-center text-sol">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sol flex items-center gap-2">
                        Verificação de Criador
                        <Badge variant="outline" className="bg-sol/10 border-sol/20 text-sol">Pendente</Badge>
                      </h3>
                      <p className="text-xs text-muted">Verifica a tua identidade para desbloqueares o Marketplace e levantamentos ilimitados.</p>
                    </div>
                  </div>
                  <Button variant="sol" size="sm" onClick={() => toast.info("Processo de verificação KYC iniciado. Por favor, carrega o teu BI.")}>Completar KYC</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === "account" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Dados da Conta</CardTitle>
                  <CardDescription>Informações privadas e de facturação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Email Principal</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input defaultValue={user?.email || ""} className="bg-superficie pl-10" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Telemóvel (Multicaixa Express)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input defaultValue="+244 923 000 000" className="bg-superficie pl-10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>Onde recebes o teu dinheiro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-superficie border border-borda rounded-button flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Conta Bancária (BAI)</p>
                        <p className="text-xs text-muted">IBAN: AO06 0040 0000 1234 5678 9012 3</p>
                      </div>
                    </div>
                    <Badge variant="success">Principal</Badge>
                  </div>
                  <Button variant="outline" className="w-full border-dashed gap-2 h-12">
                    <Plus className="w-4 h-4" /> Adicionar Novo Método
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "security" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Alterar Palavra-passe</CardTitle>
                  <CardDescription>Recomendamos uma senha forte e única.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Palavra-passe Actual</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} className="bg-superficie pr-10" />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-sol"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Nova Palavra-passe</label>
                      <Input type="password" className="bg-superficie" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted uppercase tracking-widest">Confirmar Nova Palavra-passe</label>
                      <Input type="password" className="bg-superficie" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="gradient" className="h-12 px-8">Actualizar Password</Button>
                </CardFooter>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Autenticação de Dois Factores (2FA)</CardTitle>
                  <CardDescription>Adiciona uma camada extra de segurança à tua conta.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">2FA via SMS ou App</p>
                    <p className="text-xs text-muted">Protege a tua carteira de acessos não autorizados.</p>
                  </div>
                  <Button variant="outline" className="text-sol border-sol/30">Activar 2FA</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
