import React from 'react';
import { LayoutDashboard, ShoppingBag, Wallet, GraduationCap, Settings, LogOut, Store, Users, Lock } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: false },
    { id: 'marketplace', label: 'Marketplace', icon: Store, locked: false },
    { id: 'products', label: 'Meus Produtos', icon: ShoppingBag, locked: !user.isDarkPlus },
    { id: 'affiliates', label: 'Afiliados', icon: Users, locked: false },
    { id: 'wallet', label: 'Financeiro', icon: Wallet, locked: !user.isDarkPlus },
    { id: 'education', label: 'Dark Academy', icon: GraduationCap, locked: false },
    { id: 'settings', label: 'Configurações', icon: Settings, locked: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center font-bold text-white">D</div>
          <span className="text-xl font-bold tracking-tight text-white">DARK SHOP</span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-8 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full object-cover" />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                 <p className="text-sm font-semibold text-zinc-100 truncate">{user.name}</p>
                 {user.isDarkPlus && <span className="text-[10px] bg-violet-600 text-white px-1.5 rounded font-bold">PLUS</span>}
              </div>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>
                  {item.locked && <Lock size={14} className="text-zinc-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        {!user.isDarkPlus && (
          <div className="px-4 pb-4">
             <div className="bg-gradient-to-br from-violet-900/50 to-zinc-900 border border-violet-500/20 p-4 rounded-xl text-center">
                <p className="text-white font-bold text-sm mb-1">Seja Dark Plus</p>
                <p className="text-zinc-400 text-xs mb-3">Desbloqueie saque e produtos.</p>
                <button onClick={() => onNavigate('products')} className="w-full bg-violet-600 text-white text-xs font-bold py-2 rounded">
                   Assinar Agora
                </button>
             </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;