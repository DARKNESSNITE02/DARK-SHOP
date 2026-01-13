import React, { useState } from 'react';
import { 
  Wand2, Upload, DollarSign, Users, CheckCircle, 
  ChevronRight, ChevronLeft, Image as ImageIcon,
  Layout, Globe, Lock, Link as LinkIcon, QrCode, CreditCard,
  Calculator
} from 'lucide-react';
import { ProductType, AccessType, AffiliateApprovalType, ProductStatus, PixKeyType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface CreateProductProps {
  onSave: (product: any) => void;
  onCancel: () => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // State for drag visual feedback
  const [generatedMetadata, setGeneratedMetadata] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: ProductType.COURSE,
    description: '',
    price: 0,
    imageUrl: '',
    contentUrl: '',
    customSalesPageUrl: '',
    paymentLink: '', // New field
    accessType: AccessType.IMMEDIATE,
    affiliateConfig: {
      enabled: false,
      commissionRate: 30,
      approvalType: AffiliateApprovalType.AUTOMATIC
    },
    pixKey: '',
    pixKeyType: PixKeyType.RANDOM
  });

  // --- Gemini AI Functions ---

  const generateDescription = async () => {
    if (!formData.title || !formData.type) {
      alert("Preencha o nome e o tipo do produto primeiro.");
      return;
    }
    
    setIsLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Escreva uma descrição persuasiva e profissional para um produto digital do tipo "${formData.type}" chamado "${formData.title}". 
      Foco em benefícios para o comprador. Máximo de 3 parágrafos. Em Português.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setFormData(prev => ({ ...prev, description: response.text || '' }));
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("Não foi possível gerar a descrição. Verifique sua chave de API.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateImage = async () => {
    if (!formData.title) {
      alert("Preencha o nome do produto primeiro.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash-image for standard generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Capa profissional minimalista e moderna para um produto digital chamado "${formData.title}". Estilo dark mode, cores neon violeta e ciano.` }
          ]
        },
        config: {
           imageConfig: { aspectRatio: "1:1" }
        }
      });

      // Find image part
      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          setFormData(prev => ({ ...prev, imageUrl: `data:${mimeType};base64,${base64String}` }));
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        // Fallback or error handling if no image returned
        console.warn("No image data found in response");
      }

    } catch (error) {
      console.error("Erro na IA de Imagem:", error);
      // Fallback for demo purposes if API fails or no key
      setFormData(prev => ({ ...prev, imageUrl: `https://picsum.photos/400/400?random=${Date.now()}` }));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateSalesMetadata = async () => {
    // Generate Slug, CTA and SEO snippet
    setIsLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Gere metadados de venda para o produto "${formData.title}" (${formData.type}).
      Retorne JSON com: slug (url amigável), cta (chamada para ação curta e forte), shortDescription (resumo de 1 frase).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slug: { type: Type.STRING },
              cta: { type: Type.STRING },
              shortDescription: { type: Type.STRING },
            }
          }
        }
      });
      
      const json = JSON.parse(response.text || '{}');
      setGeneratedMetadata(json);
    } catch (error) {
       console.error("Erro metadata:", error);
       setGeneratedMetadata({
         slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
         cta: 'Comprar Agora',
         shortDescription: formData.description.slice(0, 100)
       });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // --- Handlers ---

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc).');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (step === 3) {
      await generateSalesMetadata();
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handlePublish = () => {
    const finalProduct = {
      ...formData,
      id: `p-${Date.now()}`,
      // IMPORTANT: Explicitly set commissionRate at root level from config
      commissionRate: formData.affiliateConfig.enabled ? formData.affiliateConfig.commissionRate : 0,
      status: ProductStatus.ACTIVE,
      salesCount: 0,
      ownerId: 'u1',
      ...generatedMetadata
    };
    onSave(finalProduct);
  };

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Produto</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-violet-600 focus:outline-none"
              placeholder="Ex: Método Dark Shop"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1">Categoria</label>
             <select 
               value={formData.type}
               onChange={e => setFormData({...formData, type: e.target.value as ProductType})}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-violet-600 focus:outline-none"
             >
                {Object.values(ProductType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1">Preço (R$)</label>
             <div className="relative">
               <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
               <input 
                 type="number" 
                 value={formData.price}
                 onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pl-10 text-white focus:border-violet-600 focus:outline-none"
               />
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           <label className="block text-sm font-medium text-zinc-400">Capa do Produto</label>
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`flex-1 bg-zinc-900 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden group transition-all duration-200 ${
               isDragging 
                 ? 'border-violet-500 bg-violet-500/10' 
                 : 'border-zinc-800 hover:border-zinc-700'
             }`}
           >
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover absolute inset-0 rounded-xl" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <label htmlFor="image-upload-change" className="cursor-pointer text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Upload size={16} /> Trocar
                     </label>
                     <button onClick={generateImage} className="text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg flex items-center gap-2">
                       <Wand2 size={16} /> IA
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 pointer-events-none"> 
                   <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
                     <ImageIcon size={32} className="text-zinc-500" />
                   </div>
                   <div className="pointer-events-auto">
                     <p className="text-zinc-400 text-sm">
                        <label htmlFor="image-upload" className="text-white hover:text-violet-400 cursor-pointer font-bold hover:underline">Clique para enviar</label> ou arraste aqui
                     </p>
                     <p className="text-xs text-zinc-600 mt-1">PNG, JPG ou GIF (Max. 5MB)</p>
                     
                     <div className="flex items-center gap-2 justify-center my-3 opacity-50">
                        <div className="h-px bg-zinc-700 w-12"></div>
                        <span className="text-[10px] text-zinc-500 uppercase">OU</span>
                        <div className="h-px bg-zinc-700 w-12"></div>
                     </div>

                     <button 
                       onClick={generateImage}
                       disabled={isGeneratingImage}
                       className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center justify-center gap-2 w-full py-1"
                     >
                       {isGeneratingImage ? <span className="animate-pulse">Criando Arte...</span> : <><Wand2 size={14} /> Gerar Capa com IA</>}
                     </button>
                   </div>
                </div>
              )}
              
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
               <input 
                id="image-upload-change" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
           </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-zinc-400">Descrição</label>
          <button 
             onClick={generateDescription}
             disabled={isLoadingAI}
             className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
             <Wand2 size={12} /> {isLoadingAI ? 'Escrevendo...' : 'Gerar descrição com IA'}
          </button>
        </div>
        <textarea 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-violet-600 focus:outline-none h-32 resize-none"
          placeholder="Descreva o que seu produto oferece..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6">
         <h3 className="text-lg font-medium text-white flex items-center gap-2">
           <Upload size={20} className="text-violet-500" />
           Entrega do Conteúdo
         </h3>
         
         <div className="space-y-4">
            <div>
               <label className="text-sm text-zinc-400 block mb-2">Link do Material ou Arquivo</label>
               <input 
                 type="text" 
                 value={formData.contentUrl}
                 onChange={e => setFormData({...formData, contentUrl: e.target.value})}
                 placeholder="https://drive.google.com/..." 
                 className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white"
               />
               <p className="text-xs text-zinc-500 mt-1">Cole o link do Google Drive, Notion, ou área de membros.</p>
            </div>

             {/* Payment Link Configuration (Optional) */}
            <div className="pt-4 border-t border-zinc-800">
               <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                 <CreditCard size={18} className="text-blue-500"/> Link de Pagamento Externo (Opcional)
               </h4>
               <div>
                  <label className="text-sm text-zinc-400 block mb-1">Link de Checkout</label>
                  <input 
                     type="text" 
                     value={formData.paymentLink}
                     onChange={e => setFormData({...formData, paymentLink: e.target.value})}
                     placeholder="https://pay.kiwify.com.br/..." 
                     className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white focus:border-violet-600 focus:outline-none"
                   />
                   <p className="text-xs text-zinc-500 mt-1">
                      Se preenchido, os usuários serão redirecionados para este link ao clicar em "Comprar", substituindo o QR Code do Pix.
                   </p>
               </div>
            </div>

            {/* Pix Configuration */}
            <div className="pt-4 border-t border-zinc-800">
               <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                 <QrCode size={18} className="text-emerald-500"/> Configuração de Pagamento (Pix)
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="text-sm text-zinc-400 block mb-1">Tipo de Chave</label>
                   <select 
                     value={formData.pixKeyType}
                     onChange={e => setFormData({...formData, pixKeyType: e.target.value as PixKeyType})}
                     className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white focus:border-violet-600 focus:outline-none"
                   >
                     {Object.values(PixKeyType).map(t => (
                       <option key={t} value={t}>{t}</option>
                     ))}
                   </select>
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-sm text-zinc-400 block mb-1">Chave Pix</label>
                   <input 
                     type="text" 
                     value={formData.pixKey}
                     onChange={e => setFormData({...formData, pixKey: e.target.value})}
                     placeholder="Digite sua chave..." 
                     className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white focus:border-violet-600 focus:outline-none"
                   />
                 </div>
               </div>
            </div>

            {/* Manual Product Link Input */}
            <div className="pt-2 border-t border-zinc-800/50">
               <label className="text-sm text-zinc-400 block mb-2 flex justify-between">
                 <span>Link da Página de Vendas (Opcional)</span>
                 <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">Manual</span>
               </label>
               <div className="relative">
                 <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input 
                   type="text" 
                   value={formData.customSalesPageUrl}
                   onChange={e => setFormData({...formData, customSalesPageUrl: e.target.value})}
                   placeholder="https://seu-site.com/produto" 
                   className="w-full bg-zinc-950 border border-zinc-800 p-3 pl-10 rounded-lg text-white focus:border-violet-600 focus:outline-none"
                 />
               </div>
               <p className="text-xs text-zinc-500 mt-1">Se preenchido, a IA não criará o link automaticamente.</p>
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-2">Tipo de Acesso</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 {[AccessType.IMMEDIATE, AccessType.MANUAL, AccessType.SUBSCRIPTION].map(type => (
                   <div 
                     key={type}
                     onClick={() => setFormData({...formData, accessType: type})}
                     className={`cursor-pointer p-3 rounded-lg border text-center transition-all ${
                       formData.accessType === type 
                       ? 'bg-violet-600/10 border-violet-600 text-white' 
                       : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                     }`}
                   >
                     <span className="text-sm font-medium">{type}</span>
                   </div>
                 ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    // Automatic calculation for UI
    const commission = formData.affiliateConfig.commissionRate;
    const affiliateValue = (formData.price * commission) / 100;
    const producerValue = formData.price - affiliateValue;

    return (
     <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
       <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-emerald-500">
                   <Users size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-white">Programa de Afiliados</h3>
                   <p className="text-xs text-zinc-400">Permita que outros vendam por você.</p>
                </div>
             </div>
             
             <label className="relative inline-flex items-center cursor-pointer">
               <input 
                 type="checkbox" 
                 className="sr-only peer" 
                 checked={formData.affiliateConfig.enabled}
                 onChange={e => setFormData({
                   ...formData, 
                   affiliateConfig: {...formData.affiliateConfig, enabled: e.target.checked}
                 })}
               />
               <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
             </label>
          </div>

          {formData.affiliateConfig.enabled && (
             <div className="space-y-6 pt-4 border-t border-zinc-800 animate-slide-down">
                <div>
                   <div className="flex justify-between items-end mb-4">
                     <label className="text-sm text-zinc-400">
                        Comissão do Afiliado (%)
                     </label>
                     <div className="text-right">
                       <span className="text-2xl font-bold text-emerald-400">{commission}%</span>
                     </div>
                   </div>

                   <input 
                     type="range" 
                     min="5" 
                     max="90" 
                     value={commission}
                     onChange={e => setFormData({
                        ...formData,
                        affiliateConfig: {...formData.affiliateConfig, commissionRate: parseInt(e.target.value)}
                     })}
                     className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-6"
                   />

                   {/* AI/Automatic Calculation Card */}
                   <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                      <div className="p-3 bg-violet-600/10 rounded-full text-violet-400">
                         <Calculator size={20} />
                      </div>
                      <div className="flex-1 w-full grid grid-cols-2 gap-4 divide-x divide-zinc-800">
                         <div className="text-center">
                            <p className="text-xs text-zinc-500 mb-1">Você recebe</p>
                            <p className="text-lg font-bold text-white">R$ {producerValue.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-600">{100 - commission}%</p>
                         </div>
                         <div className="text-center">
                            <p className="text-xs text-zinc-500 mb-1">Afiliado recebe</p>
                            <p className="text-lg font-bold text-emerald-400">R$ {affiliateValue.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-600">{commission}%</p>
                         </div>
                      </div>
                   </div>
                   <p className="text-xs text-zinc-500 mt-2 text-center">
                      Valores baseados no preço atual de R$ {formData.price.toFixed(2)}. Taxas da plataforma não incluídas.
                   </p>
                </div>

                <div>
                   <label className="block text-sm text-zinc-400 mb-2">Aprovação de Afiliados</label>
                   <div className="flex gap-4">
                      {[AffiliateApprovalType.AUTOMATIC, AffiliateApprovalType.MANUAL].map(type => (
                         <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="approval" 
                              checked={formData.affiliateConfig.approvalType === type}
                              onChange={() => setFormData({
                                 ...formData, 
                                 affiliateConfig: {...formData.affiliateConfig, approvalType: type}
                              })}
                              className="text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-white capitalize">{type === 'AUTOMATIC' ? 'Automática' : 'Manual'}</span>
                         </label>
                      ))}
                   </div>
                </div>
             </div>
          )}
       </div>
     </div>
    );
  };

  const renderStep4 = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle size={32} />
           </div>
           <h2 className="text-2xl font-bold text-white">Quase lá!</h2>
           <p className="text-zinc-400">
             {formData.customSalesPageUrl 
               ? "Produto configurado com seu link personalizado." 
               : "Nossa IA preparou sua página de vendas."}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                 <Layout size={18} className="text-violet-500" /> Prévia da Página
              </h3>
              
              {isLoadingAI ? (
                 <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <Wand2 className="animate-spin mb-2" size={24} />
                    <p className="text-sm">Otimizando SEO e Descrição...</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    <div className="flex gap-4 p-3 bg-zinc-950 rounded border border-zinc-800">
                       {formData.imageUrl && <img src={formData.imageUrl} className="w-16 h-16 rounded object-cover" alt="mini" />}
                       <div>
                          <h4 className="font-bold text-white text-sm">{formData.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2">{generatedMetadata?.shortDescription || formData.description}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs text-zinc-500">Link de Venda {formData.customSalesPageUrl ? '(Manual)' : '(Gerado por IA)'}</label>
                       <div className={`flex items-center gap-2 text-sm p-2 rounded border ${
                         formData.customSalesPageUrl 
                           ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                           : 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                       }`}>
                          <Globe size={14} />
                          {formData.customSalesPageUrl 
                             ? <span className="truncate">{formData.customSalesPageUrl}</span>
                             : `darkshop.com/${generatedMetadata?.slug || 'produto'}`
                          }
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs text-zinc-500">Botão de Ação (CTA)</label>
                       <button className="w-full bg-emerald-600 text-white font-bold py-2 rounded text-sm">
                          {generatedMetadata?.cta || 'Comprar Agora'}
                       </button>
                    </div>
                 </div>
              )}
           </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                 <Lock size={18} className="text-violet-500" /> Resumo
              </h3>
              <ul className="space-y-3 text-sm">
                 <li className="flex justify-between">
                    <span className="text-zinc-400">Preço</span>
                    <span className="text-white">R$ {formData.price.toFixed(2)}</span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-zinc-400">Afiliados</span>
                    <span className={formData.affiliateConfig.enabled ? "text-emerald-400" : "text-zinc-600"}>
                       {formData.affiliateConfig.enabled ? `${formData.affiliateConfig.commissionRate}%` : 'Desativado'}
                    </span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-zinc-400">Pagamento Link</span>
                    <span className="text-white">{formData.paymentLink ? 'Configurado' : 'Não'}</span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-zinc-400">Pix Chave</span>
                    <span className="text-white">{formData.pixKey ? `${formData.pixKeyType}` : 'Não'}</span>
                 </li>
              </ul>
           </div>
        </div>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-white">Criar Novo Produto</h1>
         <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map(i => (
               <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-violet-600' : 'bg-zinc-800'}`} />
            ))}
         </div>
         <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
            <span>Informações</span>
            <span>Conteúdo</span>
            <span>Afiliados</span>
            <span>Publicar</span>
         </div>
      </div>

      <div className="bg-black/20 rounded-xl p-1 mb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-800">
         {step === 1 ? (
            <button onClick={onCancel} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors">
               Cancelar
            </button>
         ) : (
            <button onClick={handleBack} className="px-6 py-2 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
               <ChevronLeft size={18} /> Voltar
            </button>
         )}

         {step < 4 ? (
            <button 
               onClick={handleNext}
               className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
            >
               Próximo <ChevronRight size={18} />
            </button>
         ) : (
            <button 
               onClick={handlePublish}
               disabled={isLoadingAI}
               className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isLoadingAI ? 'Processando...' : 'Publicar Produto'}
            </button>
         )}
      </div>
    </div>
  );
};

export default CreateProduct;