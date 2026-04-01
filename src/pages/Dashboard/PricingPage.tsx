import React from "react";
import { motion } from "motion/react";
import { 
  Check, 
  Zap, 
  Crown, 
  Star, 
  TrendingUp, 
  Globe, 
  Wallet, 
  Package, 
  HeartHandshake 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { cn, formatCurrency } from "../../lib/utils";
import { toast } from "sonner";

export const PricingPage = () => {
  const plans = [
    {
      name: "Grátis",
      price: 0,
      description: "Para criadores que estão a começar a sua jornada em Angola.",
      features: [
        "Página de Tips Básica",
        "Marketplace de Marcas",
        "Analytics Básicos",
        "Levantamentos via IBAN Nacional",
        "Até 3 Produtos Digitais"
      ],
      cta: "Começar Agora",
      variant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: 15000,
      period: "/mês",
      description: "Aumenta a tua receita e profissionaliza o teu conteúdo.",
      features: [
        "Analytics Avançados Premium",
        "Wallets Internacionais (PayPal/Payoneer)",
        "Propinas Premium (Apoio Recorrente)",
        "Produtos Digitais Ilimitados",
        "Selo de Criador Verificado",
        "Taxas de Transação Reduzidas",
        "Suporte Prioritário"
      ],
      cta: "Tornar-me Premium",
      variant: "gradient" as const,
      popular: true
    },
    {
      name: "Agência",
      price: 45000,
      period: "/mês",
      description: "Para agências que gerem múltiplos criadores e grandes campanhas.",
      features: [
        "Tudo do Premium",
        "Gestão de Múltiplos Perfis",
        "Relatórios White-label para Marcas",
        "API de Integração Customizada",
        "Gestor de Conta Dedicado",
        "Acesso Antecipado a Campanhas VIP"
      ],
      cta: "Contactar Vendas",
      variant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-display font-bold">Planos e Preços</h1>
        <p className="text-muted text-lg">
          Escolhe o plano que melhor se adapta ao teu crescimento. Transforma a tua paixão num negócio sustentável em Angola.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              glow={plan.popular} 
              className={cn(
                "glass-card h-full flex flex-col relative overflow-hidden",
                plan.popular && "border-sol/50 ring-1 ring-sol/20"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-sol text-noite text-[10px] font-bold uppercase tracking-widest px-4 py-1 rotate-45 translate-x-[30%] translate-y-[50%]">
                    Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  {plan.name === "Premium" ? <Crown className="w-5 h-5 text-sol" /> : plan.name === "Agência" ? <Zap className="w-5 h-5 text-terra" /> : <Star className="w-5 h-5 text-muted" />}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display font-bold">{formatCurrency(plan.price, "AOA")}</span>
                  {plan.period && <span className="text-muted">{plan.period}</span>}
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-1">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">O que está incluído:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-verde/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-verde" />
                        </div>
                        <span className="text-texto/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Button 
                  variant={plan.variant} 
                  className="w-full h-12 text-lg font-bold"
                  onClick={() => toast.success(`Plano ${plan.name} selecionado! Redirecionando para pagamento...`)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features Detail Section */}
      <div className="mt-20 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold">Porquê ser Premium?</h2>
          <p className="text-muted">Funcionalidades exclusivas para quem leva a sério a criação de conteúdo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: TrendingUp,
              title: "Analytics Avançados",
              description: "Previsões de receita com IA, análise profunda de retenção e comparação com o mercado local."
            },
            {
              icon: Globe,
              title: "Wallets Internacionais",
              description: "Recebe em USD via PayPal ou Payoneer e converte para AOA com as melhores taxas."
            },
            {
              icon: HeartHandshake,
              title: "Propinas Premium",
              description: "Cria níveis de subscrição mensal para os teus fãs mais fiéis com benefícios exclusivos."
            },
            {
              icon: Package,
              title: "Produtos Digitais",
              description: "Vende e-books, cursos ou presets sem limites e com entrega automática via email."
            }
          ].map((feature, idx) => (
            <Card key={idx} className="glass-card border-none bg-superficie/30">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-terra/10 border border-terra/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-terra" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ or Trust Section */}
      <Card className="glass-card bg-noite/50 border-sol/20">
        <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold">Ainda tens dúvidas?</h3>
            <p className="text-muted">A nossa equipa está pronta para te ajudar a escolher o melhor caminho.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => toast.info("Chat de suporte em breve!")}>Falar com Suporte</Button>
            <Button variant="gradient">Ver FAQ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
