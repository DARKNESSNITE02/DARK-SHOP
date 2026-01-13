import React, { useState } from 'react';
import { Product, ProductStatus, User } from '../types';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Tag, X, Save, Wand2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface ProductsProps {
  products: Product[];
  user: User; // Added user prop
  onCreateClick: () => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const EditModal = ({ product, isOpen, onClose, onSave }: { product: Product | null, isOpen: boolean, onClose: () => void, onSave: (p: Product) => void }) => {
  const [formData, setFormData] = useState<Product | null>(null);

  React.useEffect(() => {
    if (product) setFormData({ ...product });
  }, [product]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Edit size={20} className="text-violet-500" /> Editar Produto
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Título</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-violet-600 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-violet-600 outline-none h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Preço (R$)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-violet-600 outline-none"
              />
            </div>
            <div>
               <label className="text-xs text-zinc-400 block mb-1">Status</label>
               <select 
                 value={formData.status}
                 onChange={e => setFormData({...formData, status: e.target.value as ProductStatus})}
                 className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-violet-600 outline-none"
               >
                 {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
          </div>
          
           <div>
            <label className="text-xs text-zinc-400 block mb-1">URL da Imagem</label>
            <input 
              type="text" 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-violet-600 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg flex items-center gap-2"
          >
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

const PromotionModal = ({ product, isOpen, onClose, onApply }: { product: Product | null, isOpen: boolean, onClose: () => void, onApply: (newPrice: number) => void }) => {
  const [newPrice, setNewPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{percentage: number, message: string} | null>(null);

  React.useEffect(() => {
    setNewPrice('');
    setAiAnalysis(null);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const calculateWithAI = async () => {
     if (!newPrice) return;
     setIsLoading(true);
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          Produto: ${product.title}
          Preço Antigo: ${product.price}
          Novo Preço Promocional: ${newPrice}
          
          Calcule a porcentagem de desconto exata (arredonde para inteiro) e crie uma frase de marketing curta e impactante (max 10 palavras) para anunciar essa promoção.
          Responda APENAS com este JSON: { "percentage": number, "message": "string" }
        `;
        
        const response = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: prompt,
           config: {
             responseMimeType: 'application/json'
           }
        });

        const json = JSON.parse(response.text || '{}');
        setAiAnalysis(json);
     } catch (e) {
        console.error(e);
        // Fallback calculation if AI fails
        const price = parseFloat(newPrice);
        const discount = Math.round(((product.price - price) / product.price) * 100);
        setAiAnalysis({ percentage: discount, message: `Grande oferta! ${discount}% OFF.` });
     } finally {
        setIsLoading(false);
     }
  };

  const handleApply = () => {
    if (newPrice) onApply(parseFloat(newPrice));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Tag size={20} className="text-emerald-500" /> Criar Promoção
        </h3>
        <p className="text-zinc-400 text-sm mb-6">Defina um novo preço e deixe a IA calcular o impacto.</p>

        <div className="space-y-4">
           <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-sm">Preço Atual</span>
              <span className="text-white font-bold line-through decoration-red-500/50">R$ {product.price.toFixed(2)}</span>
           </div>

           <div>
              <label className="text-xs text-zinc-400 block mb-1">Novo Preço Promocional</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-white focus:border-emerald-600 outline-none"
                />
                <button 
                   onClick={calculateWithAI}
                   disabled={isLoading || !newPrice}
                   className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-3 rounded-lg flex items-center gap-2"
                >
                   {isLoading ? <Wand2 className="animate-spin" size={18}/> : <Wand2 size={18} />}
                   Calcular
                </button>
              </div>
           </div>

           {aiAnalysis && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 animate-slide-down">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-emerald-400">{aiAnalysis.percentage}%</span>
                    <span className="text-emerald-500 text-sm font-medium uppercase">de Desconto</span>
                 </div>
                 <p className="text-white text-sm italic">"{aiAnalysis.message}"</p>
              </div>
           )}

           <button 
             onClick={handleApply}
             disabled={!newPrice}
             className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-2"
           >
             Aplicar Novo Preço
           </button>
        </div>
      </div>
    </div>
  );
};

const Products: React.FC<ProductsProps> = ({ products, user, onCreateClick, onUpdateProduct, onDeleteProduct }) => {
  // Filter products: show only products owned by the current logged-in user
  const myProducts = products.filter(p => p.ownerId === user.id);

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [promotingProduct, setPromotingProduct] = useState<Product | null>(null);

  const handleDeleteClick = (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir "${product.title}"? Esta ação não pode ser desfeita.`)) {
      if (onDeleteProduct) onDeleteProduct(product.id);
    }
  };

  const handleEditSave = (updatedProduct: Product) => {
    if (onUpdateProduct) onUpdateProduct(updatedProduct);
    setEditingProduct(null);
  };

  const handlePromotionApply = (newPrice: number) => {
     if (promotingProduct && onUpdateProduct) {
        const updated = { ...promotingProduct, price: newPrice };
        onUpdateProduct(updated);
        setPromotingProduct(null);
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white">Meus Produtos</h1>
           <p className="text-zinc-400 text-sm mt-1">Gerencie seus infoprodutos e acompanhe vendas.</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
           <Plus size={20} /> Criar Produto
        </button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 p-2 rounded-lg border border-zinc-800 max-w-md">
         <Search size={20} className="text-zinc-500 ml-2" />
         <input 
           type="text" 
           placeholder="Buscar meus produtos..."
           className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
         />
      </div>

      {myProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
           <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-zinc-500" />
           </div>
           <h3 className="text-white font-bold mb-2">Nenhum produto criado</h3>
           <p className="text-zinc-500 mb-6 max-w-xs mx-auto">Comece a vender seu conhecimento hoje mesmo.</p>
           <button onClick={onCreateClick} className="text-violet-400 hover:text-violet-300 font-medium">
             Criar meu primeiro produto
           </button>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                 <tr>
                   <th className="px-6 py-4 font-medium">Produto</th>
                   <th className="px-6 py-4 font-medium">Preço</th>
                   <th className="px-6 py-4 font-medium">Vendas</th>
                   <th className="px-6 py-4 font-medium">Status</th>
                   <th className="px-6 py-4 font-medium text-right">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800">
                 {myProducts.map((product) => (
                   <tr key={product.id} className="hover:bg-zinc-950/30 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={product.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-zinc-800" />
                           <div>
                              <p className="font-medium text-white">{product.title}</p>
                              <p className="text-xs text-zinc-500 capitalize">{product.type.toLowerCase()}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-white">R$ {product.price.toFixed(2)}</td>
                     <td className="px-6 py-4 text-zinc-300">{product.salesCount}</td>
                     <td className="px-6 py-4">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-medium border border-emerald-500/20">
                           {ProductStatus.ACTIVE}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                              onClick={() => setPromotingProduct(product)}
                              className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" 
                              title="Criar Promoção"
                           >
                              <Tag size={16} />
                           </button>
                           <button 
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-colors" 
                              title="Editar"
                           >
                              <Edit size={16} />
                           </button>
                           <button 
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" 
                              title="Excluir"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Modals */}
      <EditModal 
        isOpen={!!editingProduct} 
        product={editingProduct} 
        onClose={() => setEditingProduct(null)} 
        onSave={handleEditSave}
      />

      <PromotionModal 
        isOpen={!!promotingProduct} 
        product={promotingProduct} 
        onClose={() => setPromotingProduct(null)} 
        onApply={handlePromotionApply}
      />
    </div>
  );
};

export default Products;