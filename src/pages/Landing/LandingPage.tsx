import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Zap, 
  ShieldCheck, 
  Globe,
  DollarSign,
  PlayCircle,
  Instagram,
  Music2,
  Youtube,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";

export const LandingPage = () => {
  const [paidToday, setPaidToday] = useState(12450000);

  useEffect(() => {
    const interval = setInterval(() => {
      setPaidToday(prev => prev + Math.floor(Math.random() * 5000));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-noite selection:bg-terra/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-borda bg-noite/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 terra-gradient rounded-lg flex items-center justify-center font-display font-bold text-xl">K</div>
            <span className="font-display font-bold text-2xl tracking-tighter">KREATOR<span className="text-terra">.AO</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#como-funciona" className="hover:text-texto transition-colors">Como funciona</a>
            <a href="#criadores" className="hover:text-texto transition-colors">Criadores</a>
            <a href="#marcas" className="hover:text-texto transition-colors">Marcas</a>
            <a href="#precos" className="hover:text-texto transition-colors">Preços</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="gradient">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden kitenge-pattern">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-terra/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sol/10 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="sol" className="mb-6 px-4 py-1.5 text-sm">
                A primeira plataforma de monetização em Angola 🇦🇴
              </Badge>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-8">
                O teu conteúdo tem <span className="text-terra">valor</span>. <br />
                Agora tens como <span className="text-sol">recebê-lo</span>.
              </h1>
              <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
                Agregamos as tuas receitas do TikTok, YouTube e Instagram. 
                Recebe pagamentos via Multicaixa Express e bancos locais de forma simples e segura.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="gradient" className="w-full sm:w-auto text-lg group">
                    Sou Criador <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth?mode=signup&type=brand">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg">
                    Sou Marca
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-20 relative"
            >
              <div className="glass-card p-1 max-w-5xl mx-auto overflow-hidden">
                <div className="bg-noite rounded-card overflow-hidden aspect-video relative">
                  <img 
                    src="https://picsum.photos/seed/kreator/1200/800" 
                    alt="Kreator Dashboard" 
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-terra/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-button-glow">
                      <PlayCircle className="w-10 h-10 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Counter */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass-card px-8 py-6 flex flex-col items-center min-w-[300px]">
                <span className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Pagos hoje a criadores</span>
                <span className="text-3xl font-mono font-bold text-sol animate-pulse-glow">
                  {formatCurrency(paidToday, "AOA")}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Partners */}
      <section className="py-20 border-y border-borda bg-superficie/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted uppercase tracking-widest mb-12">Plataformas Suportadas</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2"><Youtube className="w-8 h-8" /> <span className="font-bold text-xl">YouTube</span></div>
            <div className="flex items-center gap-2"><Music2 className="w-8 h-8" /> <span className="font-bold text-xl">TikTok</span></div>
            <div className="flex items-center gap-2"><Instagram className="w-8 h-8" /> <span className="font-bold text-xl">Instagram</span></div>
            <div className="flex items-center gap-2"><Globe className="w-8 h-8" /> <span className="font-bold text-xl">Facebook</span></div>
            <div className="flex items-center gap-2"><Music2 className="w-8 h-8" /> <span className="font-bold text-xl">Spotify</span></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Como funciona</h2>
            <p className="text-muted max-w-2xl mx-auto">Um processo simples desenhado para a realidade do criador angolano.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Conecta", desc: "Liga as tuas contas sociais com um clique." },
              { icon: TrendingUp, title: "Agrega", desc: "Vê todas as tuas métricas e receitas num só lugar." },
              { icon: ShieldCheck, title: "Recebe", desc: "Levanta os teus fundos via Multicaixa Express." },
              { icon: Globe, title: "Cresce", desc: "Conecta-te com marcas e expande o teu negócio." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-8 text-center relative group"
              >
                <div className="w-16 h-16 terra-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-button-glow group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-borda" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section id="criadores" className="py-32 bg-superficie/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Criadores em destaque</h2>
              <p className="text-muted max-w-2xl">Junta-te aos milhares de angolanos que já estão a monetizar o seu talento.</p>
            </div>
            <Button variant="outline">Ver Todos</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "DJ Sassa", niche: "Música & Kuduro", followers: "450K", revenue: "85.000 Kz", img: "https://picsum.photos/seed/dj/400/500" },
              { name: "Ana Beauty", niche: "Lifestyle & Beleza", followers: "120K", revenue: "45.000 Kz", img: "https://picsum.photos/seed/beauty/400/500" },
              { name: "Tech Angola", niche: "Educação & Tecnologia", followers: "80K", revenue: "120.000 Kz", img: "https://picsum.photos/seed/tech/400/500" }
            ].map((creator, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group relative rounded-card overflow-hidden aspect-[3/4]"
              >
                <img 
                  src={creator.img} 
                  alt={creator.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <Badge variant="sol" className="mb-3">{creator.niche}</Badge>
                  <h3 className="text-2xl font-bold mb-1">{creator.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{creator.followers} seguidores</span>
                    <span className="text-verde font-mono font-bold">+{creator.revenue}/mês</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marcas Section */}
      <section id="marcas" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-6 border-terra text-terra">Para Marcas & Agências</Badge>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                Encontra os criadores certos para a tua <span className="text-terra">marca</span>.
              </h2>
              <p className="text-xl text-muted mb-10 leading-relaxed">
                Acede a dados reais de performance e audiência. Elimina o "achismo" e investe em criadores que realmente geram resultados em Angola.
              </p>
              
              <ul className="space-y-6 mb-12">
                {[
                  "Marketplace de criadores verificado",
                  "Métricas de audiência em tempo real",
                  "Gestão de campanhas e pagamentos centralizada",
                  "Relatórios de ROI automáticos"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-texto">
                    <div className="w-6 h-6 rounded-full bg-terra/20 flex items-center justify-center text-terra">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/auth?mode=signup&type=brand">
                <Button size="lg" variant="gradient" className="h-16 px-10 text-lg">
                  Registar como Marca
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://picsum.photos/seed/brands/800/600" 
                  alt="Brands Dashboard" 
                  className="rounded-card shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 glass-card p-6 animate-float hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-verde/20 flex items-center justify-center text-verde">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-bold">ROI Médio</p>
                    <p className="text-2xl font-bold text-verde">+340%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-32 bg-superficie/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Planos Simples e Transparentes</h2>
            <p className="text-muted text-lg">Escolhe o plano que melhor se adapta ao teu momento como criador.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="glass-card p-10 border-borda hover:border-muted transition-all flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted text-sm">Para quem está a começar agora.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-display font-bold">0 Kz</span>
                <span className="text-muted">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Até 3 Produtos Digitais",
                  "Receber Propinas (Tips)",
                  "Analytics Básicos",
                  "Levantamentos Nacionais (Express)",
                  "Taxa de 10% por transação"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted">
                    <CheckCircle2 className="w-5 h-5 text-verde" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button variant="outline" className="w-full h-14">Começar Grátis</Button>
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className="glass-card p-10 border-terra bg-terra/5 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 terra-gradient px-6 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-widest">
                Recomendado
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-terra">Premium</h3>
                <p className="text-muted text-sm">Para criadores profissionais.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-display font-bold text-sol">15.000 Kz</span>
                <span className="text-muted">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  "Produtos Digitais Ilimitados",
                  "Propinas Recorrentes (Subscrições)",
                  "Analytics Avançados (AI Insights)",
                  "Wallets Internacionais (PayPal/Payoneer)",
                  "Taxa reduzida de 5% por transação",
                  "Suporte Prioritário 24/7",
                  "Selo de Criador Verificado"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-texto">
                    <CheckCircle2 className="w-5 h-5 text-terra" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup">
                <Button variant="gradient" className="w-full h-14 shadow-button-glow">Upgrade para Premium</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="terra-gradient rounded-[32px] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full kitenge-pattern opacity-10" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Pronto para transformar a tua audiência em negócio?</h2>
              <p className="text-xl text-white/80 mb-12">Não importa o tamanho da tua rede. O que importa é o impacto que crias.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-white text-terra hover:bg-white/90 w-full sm:w-auto text-lg">
                    Criar Conta Grátis
                  </Button>
                </Link>
                <Link to="/contacts">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto text-lg">
                    Falar com Consultor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-borda">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 terra-gradient rounded-lg flex items-center justify-center font-display font-bold text-xl">K</div>
                <span className="font-display font-bold text-2xl tracking-tighter">KREATOR<span className="text-terra">.AO</span></span>
              </div>
              <p className="text-muted max-w-sm mb-8">
                A plataforma que empodera a nova economia criativa em Angola. 
                Feito por angolanos, para o mundo.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full"><Instagram className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><Youtube className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><Music2 className="w-5 h-5" /></Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Plataforma</h4>
              <ul className="space-y-4 text-sm text-muted">
                <li><a href="#" className="hover:text-sol transition-colors">Como funciona</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Criadores</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Marcas</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-muted">
                <li><a href="#" className="hover:text-sol transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-sol transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-borda flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
            <p>© 2026 KREATOR.AO. Todos os direitos reservados.</p>
            <p>Luanda, Angola 🇦🇴</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
