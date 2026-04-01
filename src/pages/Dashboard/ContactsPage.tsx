import React from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Send, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter,
  ExternalLink,
  LifeBuoy,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { toast } from "sonner";

export const ContactsPage = () => {
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Entraremos em contacto em breve.");
  };

  const contactMethods = [
    { 
      icon: Mail, 
      title: "Email", 
      value: "suporte@kreator.ao", 
      action: "Enviar Email",
      link: "mailto:suporte@kreator.ao",
      color: "text-blue-400"
    },
    { 
      icon: MessageSquare, 
      title: "WhatsApp", 
      value: "+244 9XX XXX XXX", 
      action: "Abrir Chat",
      link: "https://wa.me/2449XXXXXXXX",
      color: "text-verde"
    },
    { 
      icon: Globe, 
      title: "Website", 
      value: "www.kreator.ao", 
      action: "Visitar",
      link: "https://www.kreator.ao",
      color: "text-sol"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Contactos & Suporte</h1>
          <p className="text-muted">Estamos aqui para ajudar a impulsionar a tua carreira.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          {contactMethods.map((method, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card hover:border-sol/30 transition-all group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-superficie border border-borda flex items-center justify-center ${method.color} group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted uppercase font-bold tracking-widest">{method.title}</p>
                    <p className="font-bold">{method.value}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={method.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-terra/10 border-b border-borda">
              <CardTitle className="text-lg flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-terra" />
                Centro de Ajuda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <button className="w-full flex items-center justify-between p-3 rounded-button hover:bg-borda transition-colors text-sm">
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-muted" />
                  Perguntas Frequentes (FAQ)
                </span>
                <ExternalLink className="w-4 h-4 text-muted" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-button hover:bg-borda transition-colors text-sm">
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-muted" />
                  Termos & Privacidade
                </span>
                <ExternalLink className="w-4 h-4 text-muted" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle>Envia-nos uma Mensagem</CardTitle>
              <CardDescription>Tens alguma dúvida ou sugestão? Preenche o formulário abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Nome Completo</label>
                    <Input placeholder="Teu nome" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Email</label>
                    <Input type="email" placeholder="teu@email.com" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Assunto</label>
                  <Input placeholder="Como podemos ajudar?" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Mensagem</label>
                  <textarea 
                    className="w-full min-h-[150px] bg-superficie border border-borda rounded-button p-4 text-sm outline-none focus:border-sol transition-colors resize-none"
                    placeholder="Escreve aqui a tua mensagem..."
                    required
                  ></textarea>
                </div>

                <Button type="submit" variant="gradient" className="w-full md:w-auto px-8 h-12 gap-2">
                  <Send className="w-4 h-4" /> Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Media Links */}
      <section className="space-y-6">
        <h2 className="text-xl font-display font-bold text-center">Segue-nos nas Redes Sociais</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { icon: Instagram, label: "Instagram", color: "hover:text-pink-500", link: "#" },
            { icon: Facebook, label: "Facebook", color: "hover:text-blue-500", link: "#" },
            { icon: Twitter, label: "Twitter", color: "hover:text-sky-400", link: "#" }
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.link}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-card bg-superficie border border-borda transition-all ${social.color}`}
            >
              <social.icon className="w-8 h-8" />
              <span className="text-xs font-bold uppercase tracking-widest">{social.label}</span>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
};
