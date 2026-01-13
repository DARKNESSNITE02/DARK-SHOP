import React, { useState } from 'react';
import { Product, ProductType, User, Affiliation } from '../types';
import { Search, Filter, Share2, Star, CheckCircle, Clock, ShoppingCart, X, ExternalLink, QrCode } from 'lucide-react';

interface MarketplaceProps {
  products: Product[];
  user: User;
  userAffiliations: Affiliation[];
  onRequestAffiliation: (product: Product) => void;
  onVerifyPayment: (product: Product) => void;
}

const PurchaseModal = ({ product, isOpen, onClose, onVerify }: { product: Product | null; isOpen: boolean; onClose: () => void; onVerify: () => void }) => {
   if (!isOpen || !product) return null;

   const hasPaymentLink = !!product.paymentLink;
   const hasPixKey = !!product.pixKey;

   // Generate QR Code URL if Pix key exists
   // Using a public API for QR generation for demonstration purposes
   const qrCodeUrl = hasPixKey && !hasPaymentLink 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(product.pixKey || '')}` 
      : '';

   return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
               <X size={20} />
            </button>

            <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-white mb-1">Comprar {product.title}</h3>
               <p className="text-zinc-400">Valor: <span className="text-emerald-400 font-bold">R$ {product.price.toFixed(2)}</span></p>
            </div>

            <div className="space-y-6">
               {hasPaymentLink ? (
                  <div className="space-y-4">
                     <div className="bg-violet-900/20 border border-violet-500/30 p-4 rounded-lg text-center">
                        <p className="text-violet-200 text-sm mb-3">
                           Este produto utiliza um checkout externo. Clique abaixo para pagar.
                        </p>
                        <a 
                           href={product.paymentLink} 
                           target="_blank" 
                           rel="noreferrer"
                           className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                           Ir para Pagamento <ExternalLink size={16} />
                        </a>
                     </div>
                     <p className="text-xs text-zinc-500 text-center">
                        Após pagar, clique em "Validar Compra" para enviar o comprovante.
                     </p>
                     <button 
                        onClick={onVerify}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors"
                     >
                        Validar Compra (Enviar Comprovante)
                     </button>
                  </div>
               ) : hasPixKey ? (
                  <div className="flex flex-col items-center gap-4">
                     <p className="text-sm text-zinc-300">Escaneie o QR Code para pagar via Pix</p>
                     <div className="bg-white p-2 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code Pix" className="w-48 h-48" />
                     </div>
                     <div className="w-full bg-zinc-950 p-3 rounded border border-zinc-800 text-center">
                        <p className="text-xs text-zinc-500 mb-1">Chave Pix ({product.pixKeyType})</p>
                        <p className="text-white text-sm font-mono break-all select-all">{product.pixKey}</p>
                     </div>
                     <button 
                        onClick={onVerify}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                     >
                        Já efetuei o pagamento
                     </button>
                  </div>
               ) : (
                  <div className="text-center py-8 text-zinc-500">
                     <p>Este produto não possui método de pagamento configurado.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

const Marketplace: React.FC<MarketplaceProps> = ({ products, user, userAffiliations, onRequestAffiliation, onVerifyPayment }) => {
  const [filter, setFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = filter === 'ALL' 
    ? products 
    : products.filter(p => p.type === filter);

  const getAffiliationStatus = (productId: string) => {
    const affiliation = userAffiliations.find(a => a.productId === productId);
    return affiliation ? affiliation.status : null;
  };

  const handleAffiliateClick = (product: Product) => {
    if (product.ownerId === user.id) {
      alert("Você não pode se afiliar ao seu próprio produto.");
      return;
    }
    if (user.age < 15) {
      alert("É necessário ter pelo menos 15 anos para ser afiliado.");
      return;
    }
    onRequestAffiliation(product);
  };

  const handleBuyClick = (product: Product) => {
     setSelectedProduct(product);
  };

  const handleVerificationTrigger = () => {
     if (selectedProduct) {
        onVerifyPayment(selectedProduct);
        setSelectedProduct(null); // Close purchase modal, App will open Verification Modal
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace de Afiliação</h1>
          <p className="text-zinc-400 text-sm mt-1">Encontre produtos vencedores e ganhe comissões.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-violet-600 transition-colors placeholder-zinc-600 text-sm"
            />
          </div>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['ALL', ProductType.COURSE, ProductType.EBOOK, ProductType.MUSIC, ProductType.SUBSCRIPTION].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === type 
                ? 'bg-violet-600 text-white' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {type === 'ALL' ? 'Todos' : type}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
             <ShoppingCart size={40} className="text-zinc-600 mb-4" />
             <h3 className="text-zinc-300 font-bold mb-1">Nenhum produto encontrado</h3>
             <p className="text-zinc-500 text-sm">Seja o primeiro a publicar um produto!</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const status = getAffiliationStatus(product.id);
          const isOwner = product.ownerId === user.id;

          // Safely calculate commission value
          const commissionVal = (Number(product.price || 0) * Number(product.commissionRate || 0)) / 100;

          return (
            <div key={product.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group hover:border-violet-600/50 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                  {product.type}
                </div>
                {isOwner && (
                  <div className="absolute top-2 left-2 bg-violet-600 px-2 py-1 rounded text-xs font-bold text-white">
                    Seu Produto
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white line-clamp-1">{product.title}</h3>
                </div>
                <p className="text-zinc-400 text-xs mb-4 line-clamp-2 h-8">{product.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                     <Star size={12} className="text-yellow-500 fill-yellow-500" />
                     <span className="text-zinc-300">4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                     <span>{product.salesCount} vendas</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Preço</span>
                      <span className="font-bold text-white">R$ {product.price.toFixed(2)}</span>
                   </div>
                   {/* Explicit Commission Section */}
                   <div className="flex justify-between items-center text-sm mb-4 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                      <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider">Sua Comissão</span>
                      <div className="text-right">
                         <span className="font-bold text-emerald-400 block">
                           R$ {isNaN(commissionVal) ? '0.00' : commissionVal.toFixed(2)}
                         </span>
                         <span className="text-[10px] text-zinc-400 block font-medium bg-zinc-900 px-1 rounded mt-0.5 inline-block border border-zinc-700">
                            {product.commissionRate || 0}% por venda
                         </span>
                      </div>
                   </div>

                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleBuyClick(product)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                      >
                         <ShoppingCart size={16} /> Comprar
                      </button>

                      {status === 'APPROVED' ? (
                        <button disabled className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm cursor-default" title="Afiliado">
                          <CheckCircle size={16} />
                        </button>
                      ) : status === 'PENDING' ? (
                        <button disabled className="flex-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm cursor-default" title="Pendente">
                          <Clock size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAffiliateClick(product)}
                          disabled={isOwner}
                          className={`flex-1 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm border
                            ${isOwner 
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                            }
                          `}
                          title="Afiliar-se"
                        >
                          <Share2 size={16} />
                        </button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <PurchaseModal 
         product={selectedProduct} 
         isOpen={!!selectedProduct} 
         onClose={() => setSelectedProduct(null)} 
         onVerify={handleVerificationTrigger}
      />
    </div>
  );
};

export default Marketplace;