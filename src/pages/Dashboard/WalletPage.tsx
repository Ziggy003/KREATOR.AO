import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building2, 
  History,
  Download,
  Plus,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Crown,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { formatCurrency, cn } from "../../lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/useAuthStore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc
} from "firebase/firestore";
import { Transaction } from "../../types";

export const WalletPage = () => {
  const navigate = useNavigate();
  const { user, appUser, creatorProfile, brandProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"aoa" | "usd">("aoa");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("express");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isVerifyingKYC, setIsVerifyingKYC] = useState(false);
  const [conversionAmount, setConversionAmount] = useState("");
  const [kycData, setKycData] = useState({ fullName: "", biNumber: "", birthDate: "" });
  const [newBank, setNewBank] = useState({ bankName: "", accountHolder: "", iban: "" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profile = appUser?.type === "creator" ? creatorProfile : brandProfile;
  const balance = profile?.balance || { aoa: 0, usd: 0 };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "transactions");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bank_accounts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBankAccounts(accounts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "bank_accounts");
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "bank_accounts"), {
        uid: user.uid,
        bankName: newBank.bankName,
        accountHolder: newBank.accountHolder,
        iban: newBank.iban,
        isPrimary: bankAccounts.length === 0,
        createdAt: serverTimestamp()
      });

      toast.success("Conta bancária adicionada com sucesso!");
      setIsAddingBank(false);
      setNewBank({ bankName: "", accountHolder: "", iban: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "bank_accounts");
      toast.error("Erro ao adicionar conta bancária.");
    }
  };

  const handleDeleteBank = async (id: string) => {
    try {
      await deleteDoc(doc(db, "bank_accounts", id));
      toast.success("Conta bancária removida com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "bank_accounts");
      toast.error("Erro ao remover conta bancária.");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      // First, set all other accounts to not primary
      const updates = bankAccounts.map(account => 
        updateDoc(doc(db, "bank_accounts", account.id), { isPrimary: account.id === id })
      );
      await Promise.all(updates);
      toast.success("Conta principal actualizada!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "bank_accounts");
      toast.error("Erro ao actualizar conta principal.");
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) return;

    const amount = Number(conversionAmount);
    const currentBalance = activeTab === "aoa" ? balance.aoa : balance.usd;
    const rate = activeTab === "aoa" ? 0.0012 : 830; // Mock rates: 1 USD = 830 AOA

    if (amount > currentBalance) {
      toast.error("Saldo insuficiente.");
      return;
    }

    try {
      const targetCurrency = activeTab === "aoa" ? "usd" : "aoa";
      const convertedAmount = amount * rate;

      const profilePath = appUser.type === "creator" ? "creator_profiles" : "brand_profiles";
      const profileRef = doc(db, profilePath, user.uid);
      
      await updateDoc(profileRef, {
        [`balance.${activeTab}`]: increment(-amount),
        [`balance.${targetCurrency}`]: increment(convertedAmount)
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        date: serverTimestamp(),
        description: `Conversão de Moeda (${activeTab.toUpperCase()} para ${targetCurrency.toUpperCase()})`,
        type: "conversion",
        amount: -amount,
        currency: activeTab.toUpperCase(),
        status: "completed"
      });

      toast.success(`Conversão concluída! Recebeste ${formatCurrency(convertedAmount, targetCurrency.toUpperCase() as any)}`);
      setIsConverting(false);
      setConversionAmount("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "transactions/convert");
      toast.error("Erro ao processar conversão.");
    }
  };

  const handleVerifyKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "pending",
        kycData: {
          ...kycData,
          submittedAt: new Date().toISOString()
        }
      });

      toast.success("Documentos enviados para análise!");
      setIsVerifyingKYC(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users/kyc");
      toast.error("Erro ao enviar documentos.");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) return;

    const amount = Number(withdrawAmount);
    const currentBalance = activeTab === "aoa" ? balance.aoa : balance.usd;

    if (amount > currentBalance) {
      toast.error("Saldo insuficiente.");
      return;
    }

    try {
      // Add transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        date: serverTimestamp(),
        description: `Levantamento ${withdrawMethod === "express" ? "Multicaixa Express" : "Transferência Bancária"}`,
        type: "withdrawal",
        amount: -amount,
        currency: activeTab.toUpperCase(),
        status: "pending",
        method: withdrawMethod
      });

      // Update profile balance
      const profilePath = appUser.type === "creator" ? "creator_profiles" : "brand_profiles";
      const profileRef = doc(db, profilePath, user.uid);
      
      await updateDoc(profileRef, {
        [`balance.${activeTab}`]: increment(-amount)
      });

      toast.success(`Pedido de levantamento de ${formatCurrency(amount, activeTab === "aoa" ? "AOA" : "USD")} enviado com sucesso!`);
      setIsWithdrawing(false);
      setWithdrawAmount("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "transactions/withdraw");
      toast.error("Erro ao processar levantamento.");
    }
  };

  const totalReceived = transactions
    .filter(tx => tx.amount > 0 && tx.currency === activeTab.toUpperCase())
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalWithdrawn = Math.abs(transactions
    .filter(tx => tx.amount < 0 && tx.currency === activeTab.toUpperCase())
    .reduce((acc, tx) => acc + tx.amount, 0));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Wallet & Pagamentos</h1>
          <p className="text-muted">Gere o teu saldo, levanta fundos e configura os teus métodos de pagamento.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-superficie border border-borda rounded-button">
          <button 
            onClick={() => setActiveTab("aoa")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all",
              activeTab === "aoa" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            AOA (Kz)
          </button>
          <button 
            onClick={() => setActiveTab("usd")}
            className={cn(
              "px-4 py-2 rounded-button text-sm font-bold transition-all",
              activeTab === "usd" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            USD ($)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <Card className="lg:col-span-2 terra-gradient relative overflow-hidden p-1">
          <div className="absolute top-0 left-0 w-full h-full kitenge-pattern opacity-10" />
          <div className="bg-noite rounded-card p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Saldo Disponível</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-sol">
                {formatCurrency(activeTab === "aoa" ? balance.aoa : balance.usd, activeTab.toUpperCase() as any)}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1 text-verde text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Actualizado em tempo real</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-borda" />
                <div className="text-muted text-sm">
                  Kreator.ao Wallet
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button size="lg" variant="gradient" className="h-14 px-10 text-lg gap-2" onClick={() => setIsWithdrawing(true)}>
                Levantar Fundos <ArrowUpRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg gap-2" onClick={() => setIsConverting(true)}>
                Converter para {activeTab === "aoa" ? "USD" : "AOA"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Recebido</p>
                <h4 className="text-xl font-mono font-bold">{formatCurrency(totalReceived, activeTab.toUpperCase() as any)}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-verde/10 flex items-center justify-center text-verde">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Levantado</p>
                <h4 className="text-xl font-mono font-bold">{formatCurrency(totalWithdrawn, activeTab.toUpperCase() as any)}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Taxas Pagas</p>
                <h4 className="text-xl font-mono font-bold">{formatCurrency(totalWithdrawn * 0.015, activeTab.toUpperCase() as any)}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-sol/10 flex items-center justify-center text-sol">
                <Info className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico de Transacções</CardTitle>
              <CardDescription>Acompanha todos os teus movimentos financeiros.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-y border-borda bg-superficie/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Data</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Descrição</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Valor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borda">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">Carregando transacções...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">Nenhuma transacção encontrada.</td>
                    </tr>
                  ) : transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-muted">
                        {tx.date?.toDate ? tx.date.toDate().toLocaleDateString('pt-AO') : 'Pendente'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">{tx.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">{tx.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className={cn("px-6 py-4 text-sm font-mono font-bold", tx.amount > 0 ? "text-verde" : "text-terra")}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount, tx.currency as any)}
                      </td>
                      <td className="px-6 py-4">
                        {tx.status === "completed" && <div className="flex items-center gap-1 text-verde text-xs"><CheckCircle2 className="w-3 h-3" /> Sucesso</div>}
                        {tx.status === "pending" && <div className="flex items-center gap-1 text-sol text-xs"><Clock className="w-3 h-3" /> Pendente</div>}
                        {tx.status === "failed" && <div className="flex items-center gap-1 text-red-500 text-xs"><AlertCircle className="w-3 h-3" /> Falhou</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t border-borda py-4">
            <Button variant="ghost" size="sm">Ver mais transacções</Button>
          </CardFooter>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
              <CardDescription>Onde queres receber o teu dinheiro?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-borda rounded-button">
                  <p className="text-sm text-muted">Nenhuma conta bancária associada.</p>
                </div>
              ) : (
                bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-button border border-borda bg-noite/50 group hover:border-terra/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-button bg-superficie flex items-center justify-center text-sol">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{account.bankName}</h4>
                        <p className="text-xs text-muted">{account.iban}</p>
                      </div>
                    </div>
                    {account.isPrimary ? (
                      <Badge variant="sol">Principal</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleSetPrimary(account.id)}>Definir</Button>
                    )}
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setIsAddingBank(true)}>
                <Plus className="w-4 h-4" /> Adicionar Método
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card bg-terra/5 border-terra/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-terra/20 flex items-center justify-center text-terra shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">Verificação KYC Necessária</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Para levantamentos superiores a 500.000 Kz, precisas de verificar a tua identidade com o BI angolano.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs text-terra" onClick={() => setIsVerifyingKYC(true)}>Verificar Agora</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card overflow-hidden"
          >
            <div className="terra-gradient p-6 text-center relative">
              <button onClick={() => setIsWithdrawing(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-display font-bold">Levantar Fundos</h3>
              <p className="text-white/80 text-sm">Saldo disponível: {formatCurrency(activeTab === "aoa" ? balance.aoa : balance.usd, activeTab.toUpperCase() as any)}</p>
            </div>
            <form onSubmit={handleWithdraw} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Quanto queres levantar?</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-10 h-12 text-lg font-mono"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[10000, 50000, 100000, 500000].map(val => (
                    <button 
                      key={val}
                      type="button"
                      onClick={() => setWithdrawAmount(val.toString())}
                      className="text-[10px] font-bold px-2 py-1 bg-superficie border border-borda rounded hover:border-terra transition-colors"
                    >
                      {formatCurrency(val, "AOA")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted">Método de Levantamento</label>
                {[
                  { id: "express", name: "Multicaixa Express", icon: Smartphone, fee: "1.5%", time: "Instantâneo", premium: false },
                  { id: "bank", name: "Transferência Bancária", icon: Building2, fee: "0.8%", time: "1-2 dias", premium: false },
                  { id: "paypal", name: "PayPal", icon: Globe, fee: "3.5%", time: "2-4 dias", premium: true },
                  { id: "payoneer", name: "Payoneer", icon: Globe, fee: "2.0%", time: "1-3 dias", premium: true }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    disabled={method.premium && creatorProfile?.plan !== "premium"}
                    onClick={() => setWithdrawMethod(method.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-button border transition-all text-left relative",
                      withdrawMethod === method.id 
                        ? "border-terra bg-terra/10" 
                        : "border-borda bg-noite hover:border-muted",
                      method.premium && creatorProfile?.plan !== "premium" && "opacity-60 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5 text-sol" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{method.name}</p>
                          {method.premium && (
                            <Badge variant="sol" className="h-4 px-1 text-[8px] gap-0.5">
                              <Crown className="w-2 h-2" /> PREMIUM
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted uppercase tracking-wider">{method.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-terra">Taxa: {method.fee}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-superficie border border-borda rounded-button space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(Number(withdrawAmount) || 0, activeTab.toUpperCase() as any)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Taxa de Processamento ({withdrawMethod === "express" ? "1.5%" : "0.8%"})</span>
                  <span className="text-terra">-{formatCurrency((Number(withdrawAmount) || 0) * (withdrawMethod === "express" ? 0.015 : 0.008), activeTab.toUpperCase() as any)}</span>
                </div>
                <div className="pt-2 border-t border-borda flex justify-between font-bold">
                  <span>Total a Receber</span>
                  <span className="text-sol">{formatCurrency((Number(withdrawAmount) || 0) * (withdrawMethod === "express" ? 0.985 : 0.992), activeTab.toUpperCase() as any)}</span>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full h-12 text-lg">
                Confirmar Levantamento
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Currency Conversion Modal */}
      {isConverting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card overflow-hidden"
          >
            <div className="terra-gradient p-6 text-center relative">
              <button onClick={() => setIsConverting(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-display font-bold">Converter Moeda</h3>
              <p className="text-white/80 text-sm">Taxa actual: 1 USD = 830 AOA</p>
            </div>
            <form onSubmit={handleConvert} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Quanto queres converter?</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 text-lg font-mono"
                    value={conversionAmount}
                    onChange={e => setConversionAmount(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted">
                    {activeTab.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-superficie border border-borda rounded-button space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Vais receber aproximadamente</span>
                  <span className="text-sol font-bold">
                    {formatCurrency(
                      (Number(conversionAmount) || 0) * (activeTab === "aoa" ? 0.0012 : 830), 
                      activeTab === "aoa" ? "USD" : "AOA"
                    )}
                  </span>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full h-12 text-lg">
                Confirmar Conversão
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* KYC Verification Modal */}
      {isVerifyingKYC && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card overflow-hidden"
          >
            <div className="bg-superficie p-6 border-b border-borda flex items-center justify-between">
              <h3 className="text-xl font-display font-bold">Verificação de Identidade</h3>
              <button onClick={() => setIsVerifyingKYC(false)} className="text-muted hover:text-texto">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleVerifyKYC} className="p-8 space-y-6">
              <div className="p-4 bg-sol/5 border border-sol/20 rounded-button flex gap-3">
                <Info className="w-5 h-5 text-sol shrink-0" />
                <p className="text-xs text-muted leading-relaxed">
                  Para tua segurança e conformidade legal em Angola, precisamos de validar os teus dados oficiais.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Nome Completo (como no BI)</label>
                <Input 
                  placeholder="Teu nome completo" 
                  value={kycData.fullName}
                  onChange={e => setKycData({ ...kycData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Número do BI</label>
                <Input 
                  placeholder="000000000LA000" 
                  value={kycData.biNumber}
                  onChange={e => setKycData({ ...kycData, biNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Data de Nascimento</label>
                <Input 
                  type="date"
                  value={kycData.birthDate}
                  onChange={e => setKycData({ ...kycData, birthDate: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full h-12">
                Enviar para Análise
              </Button>
            </form>
          </motion.div>
        </div>
      )}
      {isAddingBank && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noite/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card overflow-hidden"
          >
            <div className="bg-superficie p-6 border-b border-borda flex items-center justify-between">
              <h3 className="text-xl font-display font-bold">Adicionar Conta Bancária</h3>
              <button onClick={() => setIsAddingBank(false)} className="text-muted hover:text-texto">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddBank} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Nome do Banco</label>
                <Input 
                  placeholder="Ex: Banco BAI, BFA, BIC..." 
                  value={newBank.bankName}
                  onChange={e => setNewBank({ ...newBank, bankName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Titular da Conta</label>
                <Input 
                  placeholder="Nome completo" 
                  value={newBank.accountHolder}
                  onChange={e => setNewBank({ ...newBank, accountHolder: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">IBAN</label>
                <Input 
                  placeholder="AO06 0000 0000 0000 0000 0" 
                  value={newBank.iban}
                  onChange={e => setNewBank({ ...newBank, iban: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full h-12">
                Guardar Conta
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
