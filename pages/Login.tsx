import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, Mail, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { encryptData, decryptData, hashEmail } from '../services/cryptoUtils';

interface LoginProps {
  onLogin: (user: User) => void;
}

const ADMIN_EMAIL = 'conceicaoeurico75@gmail.com';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const db = JSON.parse(localStorage.getItem('darkshop_users_db_v2') || '{}');
      const emailHash = await hashEmail(email.toLowerCase().trim());

      if (isLogin) {
        // --- LOGIN LOGIC ---
        const encryptedRecord = db[emailHash];
        
        if (!encryptedRecord) {
           alert("Usuário não encontrado. Verifique o e-mail ou cadastre-se.");
           setIsLoading(false);
           return;
        }

        try {
           const decryptedUser = await decryptData(encryptedRecord, password);
           // Success
           onLogin(decryptedUser);
        } catch (error) {
           alert("Senha incorreta.");
        }

      } else {
        // --- REGISTRATION LOGIC ---
        if (!name || !age) {
           alert("Nome e idade são obrigatórios para cadastro.");
           setIsLoading(false);
           return;
        }

        if (db[emailHash]) {
           alert("Este e-mail já está cadastrado.");
           setIsLoading(false);
           return;
        }

        const isAdmin = email.trim() === ADMIN_EMAIL;
        
        const newUser: User = {
            id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: name,
            email: email.trim(),
            age: parseInt(age),
            role: isAdmin ? UserRole.ADMIN : UserRole.PRODUCER,
            balance: 0,
            isVerified: true,
            isDarkPlus: isAdmin, 
            darkPlusExpiresAt: undefined,
            avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
        };

        // Encrypt the entire user object using the password
        const encryptedData = await encryptData(newUser, password);

        // Save to DB using hash as key (so email is not visible in keys)
        db[emailHash] = encryptedData;
        localStorage.setItem('darkshop_users_db_v2', JSON.stringify(db));

        alert("Conta criada e criptografada com sucesso!");
        onLogin(newUser);
      }
    } catch (err) {
       console.error(err);
       alert("Ocorreu um erro inesperado.");
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/10 dark:bg-violet-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 dark:bg-emerald-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 relative z-10 shadow-2xl transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">D</div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">DARK SHOP</h1>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
            {isLogin ? 'Entre na sua conta segura.' : 'Seus dados são criptografados com sua senha.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Nome Completo</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-violet-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600" 
                    placeholder="Seu nome" 
                    required={!isLogin}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Idade</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-violet-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600" 
                    placeholder="Sua idade (Mínimo 15 anos)" 
                    required={!isLogin}
                  />
                </div>
                {age && parseInt(age) < 15 && (
                  <p className="text-red-500 text-xs mt-1">É necessário ter pelo menos 15 anos.</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-violet-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600" 
                placeholder="seu@email.com" 
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Senha (Sua Chave de Criptografia)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-violet-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600" 
                placeholder="••••••••" 
                required
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && <p className="text-[10px] text-zinc-500">Atenção: Se perder a senha, seus dados não poderão ser recuperados.</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-6 transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-violet-500/20"
          >
            {isLoading ? (
               <Loader2 className="animate-spin" />
            ) : (
               <>
                 {isLogin ? 'Descriptografar e Entrar' : 'Criptografar e Criar Conta'}
                 <ArrowRight size={18} />
               </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
               setIsLogin(!isLogin);
               setEmail('');
               setPassword('');
               setName('');
            }}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:underline transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;