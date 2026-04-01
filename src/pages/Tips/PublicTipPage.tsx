import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  Building2,
  Instagram,
  Music2,
  Youtube,
  Globe,
  Share2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { formatCurrency, cn } from "../../lib/utils";
import { toast } from "sonner";

export const PublicTipPage = () => {
  const { username } = useParams();
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("express");
  const [isSuccess, setIsSuccess] = useState(false);

  const creator = {
    name: username || "Criador",
    bio: "Criador de conteúdo focado em música e cultura angolana. Ajuda-me a continuar a criar!",
    avatar: "https://picsum.photos/seed/creator/200/200",
    cover: "https://picsum.photos/seed/cover/1200/400",
    socials: {
      instagram: "@" + username,
      tiktok: "@" + username,
      youtube: username + "TV"
    },
    stats: {
      supporters: 1250,
      tips: 450
    }
  };

  const handleNext = () => {
    if (!amount || Number(amount) < 500) {
      toast.error("O valor mínimo é 500 Kz");
      return;
    }
    setStep(2);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    toast.success("Obrigado pelo teu apoio!");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-noite flex items-center justify-center p-4 kitenge-pattern">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 text-center space-y-8"
        >
          <div className="w-24 h-24 terra-gradient rounded-full flex items-center justify-center mx-auto shadow-button-glow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold">Obrigado!</h2>
            <p className="text-muted">O teu apoio de <span className="text-sol font-bold">{formatCurrency(Number(amount), "AOA")}</span> foi enviado com sucesso para <span className="text-terra font-bold">{creator.name}</span>.</p>
          </div>
          <div className="p-4 bg-superficie border border-borda rounded-button italic text-sm text-muted">
            "{message || "Sem mensagem"}"
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="gradient" className="w-full h-12" onClick={() => window.location.reload()}>Enviar outro Tip</Button>
            <Link to="/">
              <Button variant="outline" className="w-full h-12">Voltar ao KREATOR.AO</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noite selection:bg-terra/30 pb-20">
      {/* Header / Cover */}
      <div className="h-64 md:h-80 relative overflow-hidden">
        <img 
          src={creator.cover} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/50 to-transparent" />
        <div className="absolute top-8 left-8">
          <Link to="/">
            <Button variant="ghost" className="bg-noite/50 backdrop-blur-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creator Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card overflow-hidden">
              <div className="h-2 terra-gradient" />
              <CardContent className="p-8 text-center">
                <div className="w-32 h-32 rounded-full border-4 border-terra p-1 mx-auto mb-6">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">{creator.name}</h1>
                <Badge variant="sol" className="mb-6">Criador Verificado</Badge>
                <p className="text-muted text-sm leading-relaxed mb-8">{creator.bio}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-superficie border border-borda rounded-button">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Apoiantes</p>
                    <p className="text-xl font-mono font-bold">{creator.stats.supporters}</p>
                  </div>
                  <div className="p-4 bg-superficie border border-borda rounded-button">
                    <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Tips Totais</p>
                    <p className="text-xl font-mono font-bold">{creator.stats.tips}</p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.open(`https://instagram.com/${creator.socials.instagram.replace('@', '')}`, '_blank')}><Instagram className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.open(`https://tiktok.com/${creator.socials.tiktok}`, '_blank')}><Music2 className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.open(`https://youtube.com/@${creator.socials.youtube}`, '_blank')}><Youtube className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copiado para a área de transferência!");
                  }}><Share2 className="w-5 h-5" /></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card bg-terra/5 border-terra/20">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-sm mb-4">Top Apoiantes</h4>
                <div className="space-y-3">
                  {[
                    { name: "Carlos M.", amount: "15.000 Kz" },
                    { name: "Maria J.", amount: "10.000 Kz" },
                    { name: "Pedro S.", amount: "5.000 Kz" }
                  ].map((supporter, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted">{supporter.name}</span>
                      <span className="font-bold text-sol">{supporter.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tip Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-3xl font-display">Enviar uma Propina (Tip)</CardTitle>
                <CardDescription className="text-base">Apoia o trabalho do {creator.name} com um valor simbólico.</CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-muted uppercase tracking-widest">Escolhe um valor</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[500, 1000, 2500, 5000].map(val => (
                            <button
                              key={val}
                              onClick={() => setAmount(val)}
                              className={cn(
                                "h-16 rounded-button border-2 transition-all flex flex-col items-center justify-center gap-1",
                                amount === val 
                                  ? "border-terra bg-terra/10 text-terra shadow-button-glow" 
                                  : "border-borda bg-noite hover:border-muted text-muted"
                              )}
                            >
                              <span className="text-lg font-mono font-bold">{formatCurrency(val, "AOA")}</span>
                              <span className="text-[10px] uppercase font-bold opacity-60">Sugestão</span>
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                          <Input 
                            type="number" 
                            placeholder="Outro valor (mín. 500 Kz)" 
                            className="h-16 pl-12 text-xl font-mono"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-bold text-muted uppercase tracking-widest">Deixa uma mensagem (opcional)</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted" />
                          <textarea 
                            placeholder="Escreve algo simpático..." 
                            className="w-full min-h-[120px] rounded-button border border-borda bg-noite p-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-sol transition-all"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button onClick={handleNext} variant="gradient" className="w-full h-16 text-xl gap-3">
                        Continuar para Pagamento <ArrowLeft className="w-5 h-5 rotate-180" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between p-6 bg-superficie border border-borda rounded-button">
                        <div className="space-y-1">
                          <p className="text-xs text-muted uppercase font-bold tracking-wider">Valor do Apoio</p>
                          <h4 className="text-3xl font-mono font-bold text-sol">{formatCurrency(Number(amount), "AOA")}</h4>
                        </div>
                        <Button variant="ghost" onClick={() => setStep(1)} className="text-xs">Alterar</Button>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-bold text-muted uppercase tracking-widest">Método de Pagamento</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: "express", name: "Multicaixa Express", icon: Smartphone, desc: "Pagamento instantâneo" },
                            { id: "unitel", name: "Unitel Money", icon: Smartphone, desc: "Via carteira Unitel" },
                            { id: "card", name: "Cartão de Débito/Crédito", icon: CreditCard, desc: "Visa, Mastercard" },
                            { id: "bank", name: "Referência Bancária", icon: Building2, desc: "Paga no ATM ou Internet Banking" }
                          ].map(method => (
                            <button
                              key={method.id}
                              onClick={() => setPaymentMethod(method.id)}
                              className={cn(
                                "flex items-center gap-4 p-5 rounded-button border-2 transition-all text-left",
                                paymentMethod === method.id 
                                  ? "border-terra bg-terra/10" 
                                  : "border-borda bg-noite hover:border-muted"
                              )}
                            >
                              <div className="w-12 h-12 rounded-button bg-superficie flex items-center justify-center text-sol">
                                <method.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{method.name}</p>
                                <p className="text-[10px] text-muted uppercase tracking-wider">{method.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-superficie border border-borda rounded-button space-y-4">
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <CheckCircle2 className="w-4 h-4 text-verde" />
                          <span>Pagamento 100% seguro processado pelo KREATOR.AO</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <CheckCircle2 className="w-4 h-4 text-verde" />
                          <span>O criador recebe o valor instantaneamente</span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-16 text-lg">Voltar</Button>
                        <Button onClick={handlePay} variant="gradient" className="flex-[2] h-16 text-xl gap-3">
                          Pagar Agora <Heart className="w-5 h-5 fill-white" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              <CardFooter className="p-8 border-t border-borda justify-center">
                <p className="text-xs text-muted flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Plataforma de Monetização Angolana • kreator.ao
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
