import React from 'react';
import { User, Sale } from '../types';
import { Wallet as WalletIcon, ArrowUpRight, Lock, AlertTriangle } from 'lucide-react';

interface WalletProps {
  user: User;
  history: Sale[];
}

const Wallet: React.FC<WalletProps> = ({ user, history }) => {
  const isMinor = user.age < 18;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Carteira & Saques</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-violet-900/50 to-zinc-900 rounded-xl border border-violet-500/20 p-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-zinc-400 mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-bold text-white mb-6">R$ {user.balance.toFixed(2)}</h2>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <ArrowUpRight size={18} />
                Solicitar Saque (Pix)
              </button>
              <button className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-zinc-700">
                Antecipar Recebíveis
              </button>
            </div>

            {isMinor && (
              <div className="mt-6 flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-yellow-500">Conta Jovem (15-17 anos)</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Seus saques estão limitados a R$ 1.500,00 por mês conforme nossos termos de uso para menores.
                    Para aumentar este limite, solicite autorização dos responsáveis na aba Configurações.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <WalletIcon size={120} className="text-violet-400" />
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Lock size={16} />
                <span>Saldo Pendente</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-300">R$ 1.250,00</h3>
              <p className="text-xs text-zinc-500 mt-2">Valores ficam retidos por 7 a 30 dias para garantia de chargeback.</p>
           </div>
           
           <div className="mt-6 pt-6 border-t border-zinc-800">
             <div className="flex justify-between items-center text-sm mb-2">
               <span className="text-zinc-400">Próxima liberação</span>
               <span className="text-white">28 Out</span>
             </div>
             <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
               <div className="bg-zinc-600 h-full w-[65%]"></div>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Histórico Financeiro</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr className="hover:bg-zinc-950/30">
                <td className="px-6 py-4 text-zinc-400">25/10/2023</td>
                <td className="px-6 py-4 text-white">Saque Pix - Chave CPF</td>
                <td className="px-6 py-4"><span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs">Processando</span></td>
                <td className="px-6 py-4 text-right text-red-400 font-medium">- R$ 500,00</td>
              </tr>
              {history.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-950/30">
                  <td className="px-6 py-4 text-zinc-400">{sale.date}</td>
                  <td className="px-6 py-4 text-white">Venda: {sale.productName}</td>
                  <td className="px-6 py-4"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs">Aprovado</span></td>
                  <td className="px-6 py-4 text-right text-emerald-400 font-medium">+ R$ {sale.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wallet;