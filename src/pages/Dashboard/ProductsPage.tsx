import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Eye, 
  ShoppingCart, 
  DollarSign, 
  Tag, 
  Edit, 
  Trash2, 
  ArrowRight,
  Download,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  ImagePlus,
  Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { formatCurrency, cn } from "../../lib/utils";
import { toast } from "sonner";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuthStore } from "../../stores/useAuthStore";

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { user, creatorProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"digital" | "physical">("digital");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Educação",
    description: "",
    image: "",
    type: "digital" as "digital" | "physical",
    status: "active" as "active" | "inactive"
  });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "products"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (product: any = null) => {
    if (!product && creatorProfile?.plan !== "premium" && products.length >= 3) {
      toast.error("Limite de 3 produtos atingido no plano Grátis. Actualiza para Premium para produtos ilimitados!", {
        action: {
          label: "Ver Planos",
          onClick: () => navigate("/dashboard/precos")
        }
      });
      return;
    }

    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description || "",
        image: product.image || "",
        type: product.type,
        status: product.status
      });
      setImagePreview(product.image || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        category: "Educação",
        description: "",
        image: "",
        type: activeTab,
        status: "active"
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        uid: user.uid,
        updatedAt: new Date().toISOString(),
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        sales: editingProduct ? editingProduct.sales : 0,
        revenue: editingProduct ? editingProduct.revenue : 0
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast.success("Produto actualizado com sucesso!");
      } else {
        await addDoc(collection(db, "products"), productData);
        toast.success("Produto criado com sucesso!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao guardar produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este produto?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Produto eliminado!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao eliminar produto");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Os Meus Produtos</h1>
          <p className="text-muted">Gere a tua loja digital e física integrada no KREATOR.AO.</p>
        </div>
        <Button variant="gradient" className="gap-2 px-8 h-12" onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" /> Novo Produto
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sol/10 flex items-center justify-center text-sol">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-widest">Vendas Totais</p>
              <p className="text-2xl font-display font-bold">
                {products.reduce((acc, p) => acc + (p.sales || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-verde/10 flex items-center justify-center text-verde">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-widest">Receita Bruta</p>
              <p className="text-2xl font-display font-bold">
                {formatCurrency(products.reduce((acc, p) => acc + (p.revenue || 0), 0), "AOA")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-terra/10 flex items-center justify-center text-terra">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-widest">Produtos Activos</p>
              <p className="text-2xl font-display font-bold">
                {products.filter(p => p.status === "active").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-superficie border border-borda rounded-button w-full md:w-auto">
          <button 
            onClick={() => setActiveTab("digital")}
            className={cn(
              "flex-1 md:flex-none px-6 py-2 rounded-button text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === "digital" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <Download className="w-4 h-4" /> Digitais
          </button>
          <button 
            onClick={() => setActiveTab("physical")}
            className={cn(
              "flex-1 md:flex-none px-6 py-2 rounded-button text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === "physical" ? "bg-terra text-white shadow-button-glow" : "text-muted hover:text-texto"
            )}
          >
            <Package className="w-4 h-4" /> Físicos
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Pesquisar produtos..." className="pl-10 bg-superficie h-10" />
          </div>
          <Button variant="outline" className="h-10 gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-muted">Carregando produtos...</div>
        ) : products.filter(p => p.type === activeTab).length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-borda rounded-card">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted/30" />
            <p className="text-muted">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          products
            .filter(p => p.type === activeTab)
            .map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card glow className="glass-card overflow-hidden group h-full flex flex-col">
                <div className="relative h-48 overflow-hidden bg-noite">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted/20">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="sol" className="shadow-lg">{product.category}</Badge>
                  </div>
                </div>

                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">{product.name}</CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xl font-mono font-bold text-sol">{formatCurrency(product.price, "AOA")}</p>
                    <Badge variant={product.status === "active" ? "success" : "sol"} className="h-5 text-[9px] uppercase">
                      {product.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-noite/50 border border-borda rounded-button text-center">
                      <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Vendas</p>
                      <p className="text-lg font-bold">{product.sales || 0}</p>
                    </div>
                    <div className="p-3 bg-noite/50 border border-borda rounded-button text-center">
                      <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Receita</p>
                      <p className="text-lg font-bold text-verde">{formatCurrency(product.revenue || 0, "AOA")}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2 h-10" onClick={() => handleOpenModal(product)}>
                    <Edit className="w-4 h-4" /> Editar
                  </Button>
                  <Button variant="ghost" className="w-10 h-10 p-0 text-muted hover:text-red-500" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}

        {/* Add Product Placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => handleOpenModal()}
          className="border-2 border-dashed border-borda rounded-card p-12 flex flex-col items-center justify-center gap-4 text-muted hover:text-sol hover:border-sol/50 transition-all group min-h-[400px]"
        >
          <div className="w-16 h-16 rounded-full bg-superficie flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-bold">Adicionar Novo Produto</p>
            <p className="text-xs">Digital ou Físico</p>
          </div>
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-noite/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-superficie border border-borda rounded-card shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-borda flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-texto">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Nome do Produto</label>
                    <Input 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: E-book de Marketing"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Preço (AOA)</label>
                    <Input 
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Categoria</label>
                    <select 
                      className="w-full h-10 bg-noite border border-borda rounded-button px-3 text-sm outline-none focus:border-sol"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Educação</option>
                      <option>Fotografia</option>
                      <option>Moda</option>
                      <option>Música</option>
                      <option>Arte</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Tipo</label>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant={formData.type === "digital" ? "sol" : "outline"}
                        className="flex-1 h-10"
                        onClick={() => setFormData({...formData, type: "digital"})}
                      >
                        Digital
                      </Button>
                      <Button 
                        type="button"
                        variant={formData.type === "physical" ? "sol" : "outline"}
                        className="flex-1 h-10"
                        onClick={() => setFormData({...formData, type: "physical"})}
                      >
                        Físico
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Imagem do Produto</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 rounded-button border-2 border-dashed border-borda bg-superficie hover:border-sol/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-noite/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Alterar Imagem
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-sol/10 flex items-center justify-center text-sol mx-auto">
                          <ImagePlus className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">Carregar Imagem</p>
                        <p className="text-[10px] text-muted/60">JPG, PNG ou WEBP (Max 2MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Ou URL da Imagem</label>
                  <Input 
                    value={formData.image}
                    onChange={e => {
                      setFormData({...formData, image: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Descrição</label>
                  <textarea 
                    className="w-full min-h-[100px] bg-noite border border-borda rounded-button p-4 text-sm outline-none focus:border-sol transition-colors resize-none"
                    placeholder="Descreve o teu produto..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="status"
                    checked={formData.status === "active"}
                    onChange={e => setFormData({...formData, status: e.target.checked ? "active" : "inactive"})}
                    className="w-4 h-4 accent-sol"
                  />
                  <label htmlFor="status" className="text-sm font-medium text-muted cursor-pointer">Produto Activo</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient" className="flex-1 h-12">
                    {editingProduct ? "Actualizar" : "Criar Produto"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Product Types */}
      {activeTab === "digital" && (
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold">Tipos de Produtos Suportados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "E-books & PDFs", color: "text-blue-400" },
              { icon: Video, label: "Cursos & Vídeos", color: "text-sol" },
              { icon: Music, label: "Áudios & Beats", color: "text-verde" },
              { icon: ImageIcon, label: "Presets & Arte", color: "text-purple-400" }
            ].map((type, i) => (
              <Card key={i} className="glass-card text-center p-6 hover:border-sol/30 transition-all cursor-pointer">
                <type.icon className={cn("w-8 h-8 mx-auto mb-3", type.color)} />
                <p className="text-sm font-bold">{type.label}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Physical Product Alert */}
      {activeTab === "physical" && (
        <Card className="bg-sol/5 border border-sol/20 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-sol shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-bold text-sol">Logística em Angola</h3>
              <p className="text-sm text-muted leading-relaxed">
                Para produtos físicos, o KREATOR.AO tem parcerias com serviços de estafetas locais. 
                Podes configurar taxas de entrega por província e gerir o stock directamente aqui.
              </p>
              <Button variant="link" className="text-sol p-0 h-auto gap-1">
                Saber mais sobre logística <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
