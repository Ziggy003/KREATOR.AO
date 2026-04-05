import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../stores/useAuthStore";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "../../lib/utils";

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planName = searchParams.get("plan") || "Premium";
  const planPrice = searchParams.get("price") || "15.000";
  
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const iban = "000500008569242010197";
  const banco = "Banco de Comércio e Indústria (BCI)";

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText(iban);
    setCopied(true);
    toast.success("IBAN copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!user || !file || !preview) {
      toast.error("Por favor, anexe o comprovativo de pagamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "subscription_requests"), {
        uid: user.uid,
        email: user.email,
        plan: planName,
        price: planPrice,
        proofBase64: preview, // Storing as base64 for simplicity in this demo, usually should be Storage
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      toast.success("Comprovativo enviado com sucesso!", {
        description: "A tua subscrição será activada em menos de 5 minutos após verificação."
      });
      navigate("/dashboard/precos");
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Erro ao enviar comprovativo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Button 
        variant="ghost" 
        className="gap-2 text-muted hover:text-texto"
        onClick={() => navigate("/dashboard/precos")}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos Planos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Instructions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">Pagamento da Subscrição</h1>
            <p className="text-muted">
              Efectua a transferência bancária para os dados abaixo e anexa o comprovativo para activação imediata.
            </p>
          </div>

          <Card className="glass-card border-sol/20 bg-sol/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sol" /> Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-noite/50 rounded-button border border-borda space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted mb-1">Banco</p>
                  <p className="font-bold text-texto">{banco}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted mb-1">IBAN</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sol break-all">{iban}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0"
                      onClick={handleCopyIBAN}
                    >
                      {copied ? <Check className="w-4 h-4 text-verde" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted mb-1">Titular</p>
                  <p className="font-bold text-texto">KREATOR.AO - SERVIÇOS DIGITAIS</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-terra/10 border border-terra/20 rounded-button">
                <AlertCircle className="w-5 h-5 text-terra shrink-0 mt-0.5" />
                <p className="text-xs text-terra/90 leading-relaxed">
                  Certifica-te de que o valor transferido corresponde ao plano selecionado: 
                  <span className="font-bold"> {planPrice} AOA</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-bold">Como funciona?</h3>
            <div className="space-y-4">
              {[
                { step: 1, text: "Faz a transferência via Multicaixa ou Express." },
                { step: 2, text: "Tira um print ou guarda o PDF do comprovativo." },
                { step: 3, text: "Anexa o ficheiro aqui na plataforma." },
                { step: 4, text: "A nossa equipa valida em menos de 5 minutos." }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-superficie border border-borda flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <Card className="glass-card h-full flex flex-col">
            <CardHeader>
              <CardTitle>Anexar Comprovativo</CardTitle>
              <CardDescription>Formatos aceites: JPG, PNG ou PDF (Máx. 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div 
                className={cn(
                  "relative h-64 border-2 border-dashed rounded-card flex flex-col items-center justify-center transition-all",
                  preview ? "border-verde/50 bg-verde/5" : "border-borda hover:border-sol/50 bg-superficie/30"
                )}
              >
                {preview ? (
                  <div className="absolute inset-0 p-2">
                    <img 
                      src={preview} 
                      alt="Comprovativo" 
                      className="w-full h-full object-contain rounded-card"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-noite border border-borda flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-muted" />
                    </div>
                    <p className="text-sm font-medium mb-1">Clica para carregar ou arrasta o ficheiro</p>
                    <p className="text-xs text-muted">O teu comprovativo será analisado pela nossa equipa</p>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button 
                variant="gradient" 
                className="w-full h-12 text-lg font-bold gap-2"
                disabled={!file || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  "A enviar..."
                ) : (
                  <>
                    Confirmar Pagamento <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-6 bg-superficie/30 rounded-card border border-borda">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-verde/20 flex items-center justify-center text-verde">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Activação em 5 Minutos</p>
                <p className="text-xs text-muted">Garantimos rapidez na validação do teu plano.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
