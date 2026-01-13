import React, { useState, useEffect } from 'react';
import { PlayCircle, BookOpen, Award, TrendingUp, Plus, Trash2, Edit, X, Save, Upload, Video } from 'lucide-react';
import { User, Lesson } from '../types';
import { MOCK_LESSONS } from '../services/mockData';

interface EducationProps {
    user?: User;
}

const ADMIN_EMAIL = 'conceicaoeurico75@gmail.com';

const Education: React.FC<EducationProps> = ({ user }) => {
  // Initialize state directly from localStorage to prevent race conditions and allow empty arrays
  const [lessons, setLessons] = useState<Lesson[]>(() => {
      const storedLessons = localStorage.getItem('darkshop_lessons');
      if (storedLessons) {
          return JSON.parse(storedLessons);
      }
      localStorage.setItem('darkshop_lessons', JSON.stringify(MOCK_LESSONS));
      return MOCK_LESSONS;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Partial<Lesson>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
     if (user?.email === ADMIN_EMAIL) {
         setIsAdmin(true);
     }
  }, [user]);

  useEffect(() => {
     localStorage.setItem('darkshop_lessons', JSON.stringify(lessons));
  }, [lessons]);

  const handleOpenModal = (lesson?: Lesson) => {
      setVideoFile(null); // Reset uploaded file
      if (lesson) {
          setEditingLesson(lesson);
          setFormData(lesson);
      } else {
          setEditingLesson(null);
          setFormData({
              title: '',
              videoUrl: '',
              description: '',
              duration: '10 min',
              category: 'Geral',
              color: 'bg-violet-500'
          });
      }
      setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation(); // Stop click from bubbling to the card
      if (confirm("Tem certeza que deseja excluir esta aula?")) {
          setLessons(prev => prev.filter(l => l.id !== id));
      }
  };

  const handleEditClick = (e: React.MouseEvent, lesson: Lesson) => {
      e.preventDefault();
      e.stopPropagation(); // Stop click from bubbling to the card
      handleOpenModal(lesson);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setVideoFile(e.target.files[0]);
      }
  };

  const handleSave = () => {
      if (!formData.title) return alert("Título é obrigatório.");

      let finalVideoUrl = formData.videoUrl;

      // If a new file is uploaded, create a local object URL for it
      if (videoFile) {
          finalVideoUrl = URL.createObjectURL(videoFile);
      } else if (!editingLesson && !finalVideoUrl) {
          return alert("Por favor, envie um arquivo de vídeo.");
      }

      if (editingLesson) {
          // Update
          setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, ...formData, videoUrl: finalVideoUrl! } as Lesson : l));
      } else {
          // Create
          const newLesson: Lesson = {
              id: `l-${Date.now()}`,
              title: formData.title!,
              videoUrl: finalVideoUrl!,
              description: formData.description || '',
              duration: formData.duration || '0 min',
              category: formData.category || 'Geral',
              color: formData.color || 'bg-zinc-500'
          };
          setLessons(prev => [...prev, newLesson]);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Dark Academy <Award className="text-yellow-500" />
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Aprenda a faturar antes dos 18 anos. Conteúdo exclusivo da plataforma.</p>
        </div>
        
        {isAdmin && (
            <button 
                onClick={() => handleOpenModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
                <Plus size={20} /> Adicionar Aula
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-violet-900 to-violet-800 rounded-xl p-8 flex flex-col justify-center text-white relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">EM ALTA</span>
             <h2 className="text-2xl font-bold mb-2">Desafio Primeira Venda</h2>
             <p className="text-violet-200 mb-6 max-w-sm">Um plano prático de 7 dias para você sair do zero e fazer sua primeira venda na Dark Shop.</p>
             <button className="bg-white text-violet-900 px-6 py-2 rounded-lg font-bold hover:bg-zinc-100 transition-colors inline-flex items-center gap-2 w-fit">
               <PlayCircle size={20} />
               Começar Agora
             </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={200} />
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col justify-center">
           <h3 className="text-xl font-bold text-white mb-4">Seu Progresso</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Nível 1: Iniciante</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                   <div className="h-full bg-violet-600 w-[65%]"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                 <div className="bg-zinc-950 p-3 rounded text-center border border-zinc-800">
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Aulas Completas</div>
                 </div>
                 <div className="bg-zinc-950 p-3 rounded text-center border border-zinc-800">
                    <div className="text-2xl font-bold text-white">1</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Certificado</div>
                 </div>
                 <div className="bg-zinc-950 p-3 rounded text-center border border-zinc-800">
                    <div className="text-2xl font-bold text-white">120</div>
                    <div className="text-[10px] text-zinc-500 uppercase">XP</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mt-8">Trilhas de Conhecimento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all group relative">
             <div className={`h-2 ${lesson.color}`}></div>
             <div className="p-5">
               <div className="flex justify-between items-start mb-3">
                 <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold text-white ${lesson.color.replace('bg-', 'bg-opacity-20 text-').replace('500', '400')} bg-opacity-10`}>
                   {lesson.category}
                 </span>
                 <BookOpen size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
               </div>
               <h3 className="font-bold text-white mb-2 line-clamp-2">{lesson.title}</h3>
               <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{lesson.description}</p>
               
               <div className="flex items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-zinc-800">
                 <span>{lesson.duration}</span>
                 {/* <span>•</span> */}
                 {/* <span>Vídeo Aula</span> */}
               </div>
               
               <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="mt-3 block text-center w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded transition-colors">
                  Assistir Aula
               </a>
             </div>

             {/* Admin Controls */}
             {isAdmin && (
                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded p-1 backdrop-blur-sm z-20">
                     <button 
                        onClick={(e) => handleEditClick(e, lesson)} 
                        className="p-1.5 text-zinc-300 hover:text-white hover:bg-violet-600 rounded transition-colors" 
                        title="Editar"
                     >
                         <Edit size={16} />
                     </button>
                     <button 
                        onClick={(e) => handleDelete(e, lesson.id)} 
                        className="p-1.5 text-zinc-300 hover:text-white hover:bg-red-600 rounded transition-colors" 
                        title="Excluir"
                     >
                         <Trash2 size={16} />
                     </button>
                 </div>
             )}
          </div>
        ))}
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                      <X size={20} />
                  </button>
                  <h3 className="text-xl font-bold text-white mb-4">{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-zinc-400 block mb-1">Título</label>
                          <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white" />
                      </div>
                      
                      {/* Video File Input */}
                      <div>
                          <label className="text-xs text-zinc-400 block mb-1">Arquivo de Vídeo</label>
                          <div className="flex items-center gap-2">
                              <label className="flex-1 cursor-pointer bg-zinc-950 border border-zinc-800 border-dashed rounded p-3 text-center hover:bg-zinc-900 transition-colors group">
                                  <input 
                                      type="file" 
                                      accept="video/*" 
                                      onChange={handleVideoFileChange} 
                                      className="hidden" 
                                  />
                                  <div className="flex items-center justify-center gap-2 text-zinc-500 group-hover:text-white">
                                      <Upload size={16} />
                                      <span className="text-xs">
                                          {videoFile ? videoFile.name : (formData.videoUrl ? 'Alterar Vídeo' : 'Selecionar Arquivo')}
                                      </span>
                                  </div>
                              </label>
                          </div>
                          {formData.videoUrl && !videoFile && (
                              <p className="text-[10px] text-zinc-500 mt-1 truncate">Atual: {formData.videoUrl}</p>
                          )}
                      </div>

                      <div>
                          <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
                          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white h-20" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
                              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white" />
                          </div>
                          <div>
                              <label className="text-xs text-zinc-400 block mb-1">Duração</label>
                              <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white" placeholder="Ex: 45 min" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs text-zinc-400 block mb-1">Cor do Card</label>
                          <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-white">
                              <option value="bg-blue-500">Azul</option>
                              <option value="bg-emerald-500">Verde</option>
                              <option value="bg-violet-500">Violeta</option>
                              <option value="bg-rose-500">Rosa</option>
                              <option value="bg-yellow-500">Amarelo</option>
                          </select>
                      </div>

                      <button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4">
                          <Save size={18} /> Salvar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Education;