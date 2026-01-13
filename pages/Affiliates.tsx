import React, { useState } from 'react';
import { User, Affiliation } from '../types';
import { Copy, ExternalLink, TrendingUp, DollarSign, MousePointer2, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';

interface AffiliatesProps {
  user: User;
  affiliations: Affiliation[];
}

const Affiliates: React.FC<AffiliatesProps> = ({ user, affiliations }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalEarnings = affiliations.reduce((acc, curr) => acc + curr.earnings, 0);
  const totalClicks = affiliations.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalSales = affiliations.reduce((acc, curr) => acc + curr.sales, 0);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Área de Afiliados</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie suas parcerias e acompanhe seus resultados.</p>
        </div>
        
        {user.age < 18 && (
           <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle size={14} className="text-yellow-500" />
              <span className="text-xs text-yellow-500 font-medium">Conta Jovem: Limite de saque ativo</span>
           </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
               <MousePointer2 size={20} />
            </div>
            <span className="text-sm text-zinc-400">Total de Cliques</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalClicks}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
               <TrendingUp size={20} />
            </div>
            <span className="text-sm text-zinc-400">Vendas Realizadas</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSales}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
               <DollarSign size={20} />
            </div>
            <span className="text-sm text-zinc-400">Comissões (Total)</span>
          </div>
          <p className="text-2xl font-bold text-white">R$ {totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Fraud Warning */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-start gap-3">
         <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={18} />
         <div className="text-sm">
            <h4 className="font-bold text-red-400 mb-1">Sistema Antifraude Ativo</h4>
            <p className="text-zinc-400 text-xs">
               É estritamente proibido comprar através do seu próprio link de afiliado. 
               Tentativas de autocompra, spam ou manipulação de cliques resultarão no bloqueio imediato do saldo e banimento da conta.
            </p>
         </div>
      </div>

      {/* Active Affiliations List */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Produtos Afiliados</h2>
          <span className="text-xs text-zinc-500">{affiliations.length} ativos</span>
        </div>
        
        {affiliations.length === 0 ? (
           <div className="p-12 text-center text-zinc-500">
              <p>Você ainda não se afiliou a nenhum produto.</p>
              <p className="text-sm mt-2">Visite o Marketplace para começar.</p>
           </div>
        ) : (
           <div className="divide-y divide-zinc-800">
             {affiliations.map((aff) => {
               // Use customSalesPageUrl first, then contentUrl, then a fallback platform link
               const baseUrl = aff.product.customSalesPageUrl || aff.product.contentUrl || `https://darkshop.com/p/${aff.product.id}`;
               
               // Check if the URL already has query parameters to append correctly
               const separator = baseUrl.includes('?') ? '&' : '?';
               const affiliateLink = `${baseUrl}${separator}ref=${user.id}`;
               
               return (
                 <div key={aff.id} className="p-6 hover:bg-zinc-950/30 transition-colors">
                   <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Info */}
                      <div className="flex gap-4 min-w-[250px]">
                         <img src={aff.product.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
                         <div>
                            <h3 className="font-bold text-white text-sm">{aff.product.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                  ${aff.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 
                                    aff.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}
                               `}>
                                  {aff.status === 'APPROVED' ? 'Ativo' : aff.status === 'PENDING' ? 'Pendente' : 'Recusado'}
                               </span>
                               <span className="text-xs text-zinc-500">Comissão: {aff.product.commissionRate}%</span>
                            </div>
                         </div>
                      </div>

                      {/* Earnings Info */}
                      <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                         <div>
                            <p className="text-zinc-500 text-xs">Ganhos</p>
                            <p className="text-emerald-400 font-bold">R$ {aff.earnings.toFixed(2)}</p>
                         </div>
                         <div>
                            <p className="text-zinc-500 text-xs">Vendas</p>
                            <p className="text-white font-bold">{aff.sales}</p>
                         </div>
                      </div>

                      {/* Link Section */}
                      <div className="flex-1 md:max-w-md">
                         <label className="text-xs text-zinc-400 mb-1.5 block">Seu Link de Afiliado</label>
                         <div className="flex gap-2">
                            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 truncate font-mono select-all">
                               {affiliateLink}
                            </div>
                            <button 
                               onClick={() => handleCopyLink(affiliateLink, aff.id)}
                               className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded border border-zinc-700 transition-colors"
                               title="Copiar Link"
                            >
                               {copiedId === aff.id ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>
                            <a 
                               href={affiliateLink} 
                               target="_blank"
                               rel="noreferrer"
                               className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded border border-zinc-700 transition-colors"
                               title="Testar Link"
                            >
                               <ExternalLink size={16} />
                            </a>
                         </div>
                      </div>
                   </div>
                 </div>
               );
             })}
           </div>
        )}
      </div>
    </div>
  );
};

export default Affiliates;