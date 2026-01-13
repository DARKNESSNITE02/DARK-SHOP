import { User, UserRole, Product, ProductType, Sale, ChartData, ProductStatus, AccessType, AffiliateApprovalType, PixKeyType, Lesson } from '../types';

// Default clean user for initialization
export const CURRENT_USER: User = {
  id: '',
  name: '',
  email: '',
  age: 0,
  role: UserRole.PRODUCER,
  balance: 0, // Starts at 0 as requested
  isVerified: false,
  isDarkPlus: false,
  avatarUrl: ''
};

// Empty products list so only user products appear
export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_LESSONS: Lesson[] = [
    {
      id: 'l1',
      title: "Primeiros Passos no Digital",
      duration: "45 min",
      category: "Iniciante",
      color: "bg-blue-500",
      description: "Entenda como funciona o mercado de afiliados e produtores.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Demo URL
    },
    {
      id: 'l2',
      title: "Educação Financeira Jovem",
      duration: "1h 20m",
      category: "Finanças",
      color: "bg-emerald-500",
      description: "Como gerenciar seus ganhos, investir e declarar impostos sendo menor.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 'l3',
      title: "Copywriting Essencial",
      duration: "2h 10m",
      category: "Vendas",
      color: "bg-violet-500",
      description: "Escreva textos que vendem milhões na internet.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 'l4',
      title: "Tráfego Pago Básico",
      duration: "3h 00m",
      category: "Marketing",
      color: "bg-rose-500",
      description: "Aprenda a criar seus primeiros anúncios no Facebook e Google.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
];

// Empty by default for new users
export const RECENT_SALES: Sale[] = [];

// Default empty chart
export const SALES_CHART_DATA: ChartData[] = [
  { name: 'Seg', value: 0 },
  { name: 'Ter', value: 0 },
  { name: 'Qua', value: 0 },
  { name: 'Qui', value: 0 },
  { name: 'Sex', value: 0 },
  { name: 'Sab', value: 0 },
  { name: 'Dom', value: 0 },
];