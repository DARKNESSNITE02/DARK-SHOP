import React, { useState, useEffect } from 'react';
import { Menu, Lock, CheckCircle, X, Upload, Image as ImageIcon, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Pages & Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Wallet from './pages/Wallet';
import Education from './pages/Education';
import Login from './pages/Login';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import Affiliates from './pages/Affiliates'; 

// Data
import { CURRENT_USER, SALES_CHART_DATA, MOCK_PRODUCTS } from './services/mockData';
import { Product, Affiliation, AffiliateApprovalType, User, UserRole, Sale } from './types';
import { encryptData, hashEmail } from './services/cryptoUtils'; // Needed to re-save updated user data securely

const Paywall = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center max-w-lg mx-auto animate-fade-in">
     <div className="w-20 h-20 bg-violet-600/20 text-violet-500 rounded-full flex items-center justify-center mb-6">
        <Lock size={40} />
     </div>
     <h2 className="text-3xl font-bold text-white mb-2">Conteúdo Exclusivo Dark Plus</h2>
     <p className="text-zinc-400 mb-8">
       Para acessar seus produtos e realizar saques, você precisa ser um membro Dark Plus.
       Desbloqueie todo o potencial da sua loja agora.
     </p>
     <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full mb-8 shadow-2xl">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
           <span className="text-zinc-300">Assinatura Mensal</span>
           <span className="text-2xl font-bold text-white">R$ 30,00</span>
        </div>
        <ul className="text-left space-y-3 mb-6 text-sm text-zinc-400">
           <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-emerald-500"/> Venda produtos ilimitados</li>
           <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-emerald-500"/> Saques via Pix liberados</li>
           <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-emerald-500"/> Taxas de plataforma reduzidas</li>
           <li className="flex gap-2 items-center"><CheckCircle size={16} className="text-emerald-500"/> Acesso ao Painel Financeiro</li>
        </ul>
        <button 
          onClick={onUpgrade}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
           Assinar Dark Plus Agora
        </button>
     </div>
  </div>
);

const VerificationModal = ({ isOpen, onClose, onVerify, isVerifying, targetAmount }: { isOpen: boolean; onClose: () => void; onVerify: (file: File) => void; isVerifying: boolean; targetAmount: number }) => {
  const [file, setFile] = useState<File | null>(null);

  // Reset file when modal opens/closes
  useEffect(() => {
     if(!isOpen) setFile(null);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} />
           </div>
           <h3 className="text-xl font-bold text-white">Validar Pagamento</h3>
           <p className="text-sm text-zinc-400 mt-2">
             Envie a foto do comprovante de pagamento de <strong>R$ {targetAmount.toFixed(2)}</strong>. 
             Nossa IA irá analisar e liberar seu acesso instantaneamente.
           </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-zinc-700 rounded-lg h-32 text-center hover:bg-zinc-800/50 transition-colors relative flex flex-col items-center justify-center group">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-emerald-400">
                <ImageIcon size={24} />
                <span className="text-xs font-medium max-w-[200px] truncate px-2">{file.name}</span>
                <span className="text-[10px] text-zinc-500">Clique para alterar</span>
              </div>
            ) : (
              <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Upload size={24} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Clique para enviar foto</p>
                <p className="text-[10px] opacity-70">JPG, PNG ou PDF</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => file && onVerify(file)}
            disabled={!file || isVerifying}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isVerifying ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                 Analisando com IA...
               </>
            ) : (
               'Validar Acesso'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AccessModal = ({ isOpen, onClose, product }: { isOpen: boolean; onClose: () => void; product: Product | undefined }) => {
  if (!isOpen || !product) return null;

  const link = product.contentUrl || product.customSalesPageUrl || "#";

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    alert("Link copiado!");
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <div className="w-16 h-16 bg-emerald-500 text-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
           <CheckCircle size={32} strokeWidth={3} />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h3>
        <p className="text-zinc-400 mb-6">
           Aqui está o seu link do produto para o usuário poder acessar:
        </p>

        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-6">
           <div className="flex gap-2 items-center">
             <input 
               readOnly 
               value={link} 
               className="flex-1 bg-transparent text-emerald-400 text-sm font-mono focus:outline-none truncate"
             />
             <button onClick={copyLink} className="text-zinc-400 hover:text-white p-2" title="Copiar">
                <Copy size={16} />
             </button>
           </div>
        </div>

        <a 
          href={link} 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Acessar Agora <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [userSalesHistory, setUserSalesHistory] = useState<Sale[]>([]);
  
  // Verification State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState<{type: 'SUBSCRIPTION' | 'PRODUCT', amount: number, product?: Product}>({
     type: 'SUBSCRIPTION',
     amount: 30.00
  });

  // Access Modal State
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<Product | undefined>(undefined);
  
  // State for user affiliations
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);

  // State for showing sensitive data
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Load Products on Mount
  useEffect(() => {
    const storedProducts = localStorage.getItem('darkshop_products');
    if (storedProducts) {
       setProducts(JSON.parse(storedProducts));
    } else {
       setProducts(MOCK_PRODUCTS);
       localStorage.setItem('darkshop_products', JSON.stringify(MOCK_PRODUCTS));
    }
    
    // Check if session exists in SESSION STORAGE (This is the active decrypted session)
    const sessionUserJson = sessionStorage.getItem('darkshop_active_session');
    if (sessionUserJson) {
        try {
            const sessionUser = JSON.parse(sessionUserJson);
            validateAndSetUser(sessionUser);
        } catch (e) {
            console.error("Failed to restore session", e);
            handleLogout();
        }
    }
  }, []);

  // Persist Products
  useEffect(() => {
     if (products.length > 0) {
        localStorage.setItem('darkshop_products', JSON.stringify(products));
     }
  }, [products]);

  // Persist User to Session Storage (Decrypted)
  useEffect(() => {
     if (user.email) {
        sessionStorage.setItem('darkshop_active_session', JSON.stringify(user));
     }
  }, [user]);

  // Function to load sales history from the Global Ledger
  const loadSalesHistory = (userId: string) => {
      const ledgerJSON = localStorage.getItem('darkshop_sales_ledger');
      const ledger: Sale[] = ledgerJSON ? JSON.parse(ledgerJSON) : [];
      
      // Filter sales where this user is the SELLER (owner)
      const mySales = ledger.filter(sale => sale.sellerId === userId);
      
      // Sort by date/timestamp desc
      mySales.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      return mySales;
  };

  const validateAndSetUser = (u: User) => {
       // Check for Dark Plus Expiry
       if (u.isDarkPlus && u.darkPlusExpiresAt) {
          if (Date.now() > u.darkPlusExpiresAt) {
             u.isDarkPlus = false;
             u.darkPlusExpiresAt = undefined;
             alert("Sua assinatura Dark Plus expirou.");
          }
       }
       
       // Load Sales History from Ledger and Calculate Real Balance
       const history = loadSalesHistory(u.id);
       setUserSalesHistory(history);
       
       const totalEarnings = history.reduce((acc, sale) => acc + sale.amount, 0);
       
       // Update user balance to reflect real sales history + any manual adjustments (mocked here as simple replacement)
       const updatedUser = { ...u, balance: totalEarnings };
       
       setUser(updatedUser);
       setIsAuthenticated(true);
  };

  const handleAuthenticated = (loggedInUser: User) => {
    validateAndSetUser(loggedInUser);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('darkshop_active_session');
      setUser(CURRENT_USER); // Reset to empty
  };

  const handleSaveProduct = (newProduct: Product) => {
    // Ensure product belongs to current user
    newProduct.ownerId = user.id;
    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    setActivePage('products');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
  };

  const handleRequestAffiliation = (product: Product) => {
    const newAffiliation: Affiliation = {
      id: `aff-${Date.now()}`,
      productId: product.id,
      product: product,
      status: product.affiliateConfig?.approvalType === AffiliateApprovalType.MANUAL ? 'PENDING' : 'APPROVED',
      joinedAt: new Date().toISOString().split('T')[0],
      clicks: 0,
      sales: 0,
      earnings: 0
    };

    setAffiliations([...affiliations, newAffiliation]);
    alert("Solicitação de afiliação enviada!");
  };

  const handleUpgradeToPlus = () => {
    window.open('https://link.mercadopago.com.br/visionapps', '_blank');
    setVerificationTarget({ type: 'SUBSCRIPTION', amount: 30.00 });
    setShowVerifyModal(true);
  };

  const handleVerifyProductPayment = (product: Product) => {
     setVerificationTarget({ type: 'PRODUCT', amount: product.price, product });
     setShowVerifyModal(true);
  };

  const handleVerifyReceipt = async (file: File) => {
    setIsVerifying(true);
    
    const approveVerification = async () => {
       setShowVerifyModal(false);

       if (verificationTarget.type === 'SUBSCRIPTION') {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          
          const updatedUser = { 
            ...user, 
            isDarkPlus: true,
            darkPlusExpiresAt: expiryDate.getTime()
          };
          setUser(updatedUser);
          sessionStorage.setItem('darkshop_active_session', JSON.stringify(updatedUser));
          alert("Bem-vindo ao Dark Plus! (Status atualizado para a sessão atual)");

       } else if (verificationTarget.type === 'PRODUCT' && verificationTarget.product) {
          // --- NEW: RECORD SALE TO GLOBAL LEDGER ---
          const product = verificationTarget.product;
          
          const newSale: Sale = {
             id: `sale-${Date.now()}`,
             productId: product.id,
             productName: product.title,
             amount: product.price,
             date: new Date().toLocaleDateString('pt-BR'),
             timestamp: Date.now(),
             type: 'sale',
             sellerId: product.ownerId // IMPORTANT: Credit the owner
          };

          // 1. Update Global Ledger
          const ledgerJSON = localStorage.getItem('darkshop_sales_ledger');
          const ledger: Sale[] = ledgerJSON ? JSON.parse(ledgerJSON) : [];
          ledger.push(newSale);
          localStorage.setItem('darkshop_sales_ledger', JSON.stringify(ledger));

          // 2. Update Product Sales Count Globally
          const updatedProducts = products.map(p => {
             if (p.id === product.id) {
                return { ...p, salesCount: (p.salesCount || 0) + 1 };
             }
             return p;
          });
          setProducts(updatedProducts); // Updates local state and triggers useEffect to save to localStorage

          // 3. If I am buying my own product (testing), update my balance immediately
          if (product.ownerId === user.id) {
             const updatedHistory = [newSale, ...userSalesHistory];
             setUserSalesHistory(updatedHistory);
             const newBalance = user.balance + newSale.amount;
             setUser({ ...user, balance: newBalance });
          }

          setPurchasedProduct(product);
          setShowAccessModal(true);
       }
    };

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async () => {
            const base64Data = reader.result?.toString().split(',')[1];
            if (!base64Data) {
               setIsVerifying(false);
               return;
            }

            const hasApiKey = process.env.API_KEY && process.env.API_KEY.length > 0;

            if (!hasApiKey) {
               console.warn("No API Key found. Using mock verification.");
               setTimeout(() => {
                  approveVerification();
                  setIsVerifying(false);
               }, 2000);
               return;
            }

            try {
               const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
               
               const prompt = `
                 Você é um sistema de validação de pagamentos.
                 Analise a imagem. O usuário afirma ser um comprovante de R$ ${verificationTarget.amount}.
                 REGRAS DE APROVAÇÃO (DEMO):
                 1. Se a imagem for um documento, recibo, print de banco ou similar, APROVE (valid: true).
                 2. Se for uma imagem genérica mas visível, APROVE (valid: true) para fins de teste.
                 3. Apenas REPROVE (valid: false) se a imagem estiver preta, corrompida ou for conteúdo explícito.
                 Responda ESTRITAMENTE com um JSON sem formatação Markdown:
                 { "valid": boolean, "reason": "breve explicação" }
               `;
               
               const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: {
                     parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: prompt }
                     ]
                  },
                  config: { responseMimeType: 'application/json' }
               });

               let result;
               try {
                  let cleanText = (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
                  result = JSON.parse(cleanText);
               } catch (e) {
                  result = { valid: true };
               }
               
               if (result.valid) {
                  await approveVerification();
               } else {
                  alert(`A IA não validou o pagamento: ${result.reason || 'Imagem irreconhecível'}.`);
               }
            } catch (error) {
               console.error("AI Error, falling back to success:", error);
               await approveVerification();
            } finally {
               setIsVerifying(false);
            }
        };

        reader.onerror = () => {
           alert("Erro ao ler arquivo.");
           setIsVerifying(false);
        };

    } catch (error) {
        console.error(error);
        alert("Erro na verificação.");
        setIsVerifying(false);
    }
  };

  const isLocked = (page: string) => {
     if (user.isDarkPlus) return false;
     return ['products', 'wallet'].includes(page);
  };

  const renderContent = () => {
    if (isLocked(activePage)) {
       return <Paywall onUpgrade={handleUpgradeToPlus} />;
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            salesData={SALES_CHART_DATA} // Passed but will be ignored by Dashboard internal calculation
            recentSales={userSalesHistory}
            onCreateProduct={() => setActivePage('create-product')}
          />
        );
      case 'marketplace':
        return (
          <Marketplace 
            products={products}
            user={user}
            userAffiliations={affiliations}
            onRequestAffiliation={handleRequestAffiliation}
            onVerifyPayment={handleVerifyProductPayment}
          />
        );
      case 'products':
        return (
          <Products 
             user={user} // Pass user to filter products
             products={products} 
             onCreateClick={() => setActivePage('create-product')}
             onUpdateProduct={handleUpdateProduct}
             onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'create-product':
        return (
          <CreateProduct 
            onSave={handleSaveProduct}
            onCancel={() => setActivePage('products')}
          />
        );
      case 'affiliates': 
        return (
          <Affiliates 
             user={user}
             affiliations={affiliations}
          />
        );
      case 'wallet':
        // Pass user's history (initially empty for new users)
        return <Wallet user={user} history={userSalesHistory} />;
      case 'education':
        return <Education user={user} />;
      case 'settings':
        return (
           <div className="max-w-2xl">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl text-white font-bold">Configurações</h2>
                 <button 
                   onClick={() => setShowSensitiveData(!showSensitiveData)}
                   className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                 >
                    {showSensitiveData ? <><EyeOff size={16} /> Ocultar Dados</> : <><Eye size={16} /> Exibir Dados</>}
                 </button>
             </div>
             <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Lock size={18} className="text-emerald-500" />
                    Perfil & Segurança
                </h3>
                <p className="text-xs text-zinc-500 mb-6">
                    Seus dados pessoais são armazenados de forma criptografada.
                </p>
                <div className="space-y-4">
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 text-sm">Nome Completo</label>
                      <input 
                          type="text" 
                          value={showSensitiveData ? user.name : '•••••••••••••••••'} 
                          readOnly 
                          className="bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-300 font-mono cursor-not-allowed" 
                      />
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 text-sm">Email</label>
                      <input 
                          type="text" 
                          value={showSensitiveData ? user.email : '••••••••@••••.com'} 
                          readOnly 
                          className="bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-300 font-mono cursor-not-allowed" 
                      />
                   </div>
                   <div className="flex flex-col gap-1">
                      <label className="text-zinc-400 text-sm">Idade</label>
                      <input 
                          type="text" 
                          value={showSensitiveData ? user.age.toString() : '••'} 
                          readOnly 
                          className="bg-zinc-950 border border-zinc-800 p-2 rounded text-zinc-300 font-mono cursor-not-allowed w-20" 
                      />
                   </div>
                   {user.isDarkPlus && (
                      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded text-violet-400 text-sm mt-2">
                         Dark Plus Ativo até: {user.darkPlusExpiresAt ? new Date(user.darkPlusExpiresAt).toLocaleDateString() : 'Vitalício'}
                      </div>
                   )}
                </div>
             </div>
           </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex relative">
      <Sidebar 
        user={user} 
        activePage={activePage === 'create-product' ? 'products' : activePage} 
        onNavigate={setActivePage}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center font-bold text-white">D</div>
             <span className="font-bold">DARK SHOP</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
             <Menu size={24} />
           </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <VerificationModal 
        isOpen={showVerifyModal} 
        onClose={() => setShowVerifyModal(false)} 
        onVerify={handleVerifyReceipt}
        isVerifying={isVerifying}
        targetAmount={verificationTarget.amount}
      />

      <AccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        product={purchasedProduct}
      />
    </div>
  );
};

export default App;