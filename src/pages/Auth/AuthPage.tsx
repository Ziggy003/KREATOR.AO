import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { 
  ArrowRight, 
  Briefcase, 
  Building2, 
  CheckCircle2,
  Globe,
  Instagram,
  User, 
  Mail,
  Lock
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    type: "creator",
  });

  const navigate = useNavigate();
  const { login, loginWithEmail, signupWithEmail } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await loginWithEmail(formData.email, formData.password);
      } else {
        await signupWithEmail(formData.email, formData.password, formData.type as any);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-noite flex items-center justify-center p-4 kitenge-pattern">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-terra/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sol/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 terra-gradient rounded-lg flex items-center justify-center font-display font-bold text-xl">K</div>
            <span className="font-display font-bold text-2xl tracking-tighter">KREATOR<span className="text-terra">.AO</span></span>
          </Link>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display">
              {isLogin ? "Entrar na tua conta" : "Criar a tua conta"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Bem-vindo de volta ao KREATOR.AO" : "Junta-te à maior comunidade de criadores de Angola"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input 
                          type="email" 
                          placeholder="teu@email.com" 
                          className="pl-10"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted">Password</label>
                        <button type="button" className="text-xs text-sol hover:underline">Esqueceste?</button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="gradient" className="w-full h-12 text-base">
                      Entrar
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-borda"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-superficie px-2 text-muted">Ou entrar com</span></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 gap-3 font-bold"
                      onClick={() => login(formData.type as any)}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-muted block text-center">Eu sou um...</label>
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[
                        { id: "creator", icon: User, label: "Criador" },
                        { id: "brand", icon: Building2, label: "Marca" },
                        { id: "agency", icon: Briefcase, label: "Agência" }
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({...formData, type: type.id})}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-button border transition-all",
                            formData.type === type.id 
                              ? "border-terra bg-terra/10 text-terra" 
                              : "border-borda bg-noite hover:border-muted text-muted"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Email</label>
                        <Input 
                          type="email" 
                          placeholder="teu@email.com" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Password</label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="gradient" 
                      className="w-full h-12 text-base font-bold"
                    >
                      Criar Conta
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-borda"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-superficie px-2 text-muted">Ou criar com</span></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 gap-3 font-bold"
                      onClick={() => login(formData.type as any)}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted">
                {isLogin ? "Não tens uma conta?" : "Já tens uma conta?"}{" "}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                  }}
                  className="text-sol font-bold hover:underline"
                >
                  {isLogin ? "Regista-te" : "Entra aqui"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted px-8">
          Ao continuar, concordas com os nossos <a href="#" className="underline">Termos de Serviço</a> e <a href="#" className="underline">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
};
