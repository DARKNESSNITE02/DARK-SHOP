import React, { useMemo } from 'react';
import { User, ChartData, Sale } from '../types';
import { DollarSign, ShoppingCart, TrendingUp, Users, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  salesData: ChartData[];
  recentSales: Sale[];
  onCreateProduct?: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: any; trend?: string }> = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800">
        <Icon size={20} className="text-violet-600 dark:text-violet-500" />
      </div>
      {trend && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, recentSales, onCreateProduct }) => {
  
  // Calculate stats dynamically based on actual history
  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('pt-BR'); // Format: DD/MM/YYYY

    const salesToday = recentSales
      .filter(sale => sale.date === todayStr)
      .reduce((acc, sale) => acc + sale.amount, 0);

    const totalRevenue = recentSales.reduce((acc, sale) => acc + sale.amount, 0);
    const newClients = recentSales.length;

    return {
      today: salesToday,
      total: totalRevenue,
      clients: newClients
    };
  }, [recentSales]);

  // Generate Chart Data from Recent Sales (Last 7 Days)
  const chartData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const today = new Date();
    const last7Days: ChartData[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR');
      const dayName = days[d.getDay()];
      
      const dailyTotal = recentSales
        .filter(sale => sale.date === dateStr)
        .reduce((acc, sale) => acc + sale.amount, 0);

      last7Days.push({ name: dayName, value: dailyTotal });
    }

    return last7Days;
  }, [recentSales]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Bem-vindo, {user.name} 👋</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Aqui está o resumo do seu negócio digital.</p>
        </div>
        <div className="flex gap-2">
          {onCreateProduct && (
            <button 
              onClick={onCreateProduct}
              className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-200 dark:border-zinc-700"
            >
              <Plus size={16} /> Criar Produto
            </button>
          )}
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
            Novo Saque
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Saldo Disponível" 
          value={`R$ ${user.balance.toFixed(2)}`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Vendas Hoje" 
          value={`R$ ${stats.today.toFixed(2)}`} 
          icon={ShoppingCart} 
          trend={stats.today > 0 ? "+100%" : undefined}
        />
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.total.toFixed(2)}`} 
          icon={TrendingUp} 
          trend={stats.total > 0 ? "+100%" : undefined}
        />
        <StatCard 
          title="Vendas Realizadas" 
          value={stats.clients.toString()} 
          icon={Users} 
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Receita nos últimos 7 dias</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--tw-prose-invert-bg)', borderColor: 'var(--tw-prose-invert-borders)', borderRadius: '8px' }}
                itemStyle={{ color: '#8b5cf6' }}
                // We use a custom tooltip wrapper to handle dark mode class injection better or rely on simple css variables
                wrapperClassName="text-zinc-900 dark:text-white"
              />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Vendas Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          {recentSales.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-500">
              <p>Nenhuma venda realizada ainda.</p>
              <p className="text-xs mt-1">Compartilhe seus produtos para começar a faturar.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-zinc-950/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{sale.productName}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{sale.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.type === 'sale' 
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {sale.type === 'sale' ? 'Venda Direta' : 'Comissão'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-900 dark:text-white font-medium">
                      + R$ {sale.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;