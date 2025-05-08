import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Book, FileText, Video, ExternalLink, Calendar, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  image: string;
  tags: string[];
  date: string;
}

const ResourceCenterPage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock resources data (in a real app, this would come from an API)
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const mockResources: Resource[] = [
        {
          id: "1",
          title: "Como validar sua ideia de startup em 7 dias",
          description: "Um guia rápido para testar e validar sua ideia de negócio com potenciais clientes em apenas uma semana.",
          category: "guides",
          type: "article",
          url: "/recursos/guias/como-validar-ideia",
          image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2940&auto=format&fit=crop",
          tags: ["validação", "mvp", "cliente"],
          date: "2023-10-15"
        },
        {
          id: "2",
          title: "Entendendo métricas de startups",
          description: "Aprenda quais métricas são essenciais para acompanhar o crescimento da sua startup e como interpretá-las.",
          category: "guides",
          type: "article",
          url: "/recursos/guias/metricas-essenciais",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
          tags: ["métricas", "crescimento", "análise"],
          date: "2023-11-02"
        },
        {
          id: "3",
          title: "Como a Nubank revolucionou o mercado bancário",
          description: "Case study detalhado sobre como o Nubank identificou uma oportunidade no mercado e se tornou um unicórnio.",
          category: "success-cases",
          type: "case-study",
          url: "/recursos/casos-de-sucesso/nubank",
          image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2671&auto=format&fit=crop",
          tags: ["fintech", "case", "unicórnio"],
          date: "2023-09-20"
        },
        {
          id: "4",
          title: "Marketing digital para startups em fase inicial",
          description: "Webinar com especialistas sobre como implementar estratégias eficazes de marketing com orçamento limitado.",
          category: "webinars",
          type: "video",
          url: "/recursos/webinars/marketing-digital",
          image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop",
          tags: ["marketing", "aquisição", "orçamento"],
          date: "2023-12-05"
        },
        {
          id: "5",
          title: "Fontes de financiamento para startups no Brasil",
          description: "Um guia completo sobre as diferentes opções de financiamento disponíveis para startups brasileiras.",
          category: "blog",
          type: "article",
          url: "/recursos/blog/financiamento-startups",
          image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=2940&auto=format&fit=crop",
          tags: ["investimento", "capital", "financiamento"],
          date: "2023-11-15"
        },
        {
          id: "6",
          title: "Pitch perfeito: Como apresentar sua ideia para investidores",
          description: "Aprenda a estruturar e entregar um pitch convincente que capture a atenção dos investidores.",
          category: "guides",
          type: "article",
          url: "/recursos/guias/pitch-perfeito",
          image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2942&auto=format&fit=crop",
          tags: ["pitch", "investidores", "apresentação"],
          date: "2023-10-28"
        },
        {
          id: "7",
          title: "iFood: Da entrega de comida à super app",
          description: "Análise da jornada do iFood e como a empresa expandiu seu modelo de negócio para se tornar um super app.",
          category: "success-cases",
          type: "case-study",
          url: "/recursos/casos-de-sucesso/ifood",
          image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=2671&auto=format&fit=crop",
          tags: ["foodtech", "expansão", "modelo de negócio"],
          date: "2023-08-10"
        },
        {
          id: "8",
          title: "Tendências de tecnologia para 2024",
          description: "Webinar com especialistas discutindo as principais tendências tecnológicas que moldarão o mercado em 2024.",
          category: "webinars",
          type: "video",
          url: "/recursos/webinars/tendencias-tecnologia-2024",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2940&auto=format&fit=crop",
          tags: ["tendências", "tecnologia", "inovação"],
          date: "2023-12-12"
        }
      ];
      
      setResources(mockResources);
      setFilteredResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter resources based on search query and active category
  useEffect(() => {
    let filtered = [...resources];
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(resource => resource.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        resource =>
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredResources(filtered);
  }, [resources, searchQuery, activeCategory]);
  
  // Get icon for resource card
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5 text-brand-purple" />;
      case "video":
        return <Video className="h-5 w-5 text-brand-purple" />;
      case "case-study":
        return <Book className="h-5 w-5 text-brand-purple" />;
      default:
        return <FileText className="h-5 w-5 text-brand-purple" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('resources.title') || "Central de Recursos"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('resources.subtitle') || "Explore artigos, guias, casos de sucesso e webinars para aprimorar seus conhecimentos"}
        </p>
      </div>
      
      {/* Search and filter section */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('resources.searchPlaceholder') || "Pesquisar recursos..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {t('resources.allResources') || "Todos"}
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {t('resources.guides') || "Guias"}
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {t('resources.blog') || "Blog"}
          </TabsTrigger>
          <TabsTrigger value="success-cases" className="flex items-center gap-1">
            <Book className="h-4 w-4" />
            {t('resources.successCases') || "Casos de Sucesso"}
          </TabsTrigger>
          <TabsTrigger value="webinars" className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            {t('resources.webinars') || "Webinars"}
          </TabsTrigger>
        </TabsList>
        
        {/* Content for each category */}
        {["all", "guides", "blog", "success-cases", "webinars"].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {loading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="shadow-sm animate-pulse">
                    <div className="h-40 bg-muted rounded-t-lg"></div>
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="shadow-sm overflow-hidden">
                    <div 
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${resource.image})` }}
                    ></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="mb-2">
                          {getResourceType(resource.type, t)}
                        </Badge>
                        {getResourceIcon(resource.type)}
                      </div>
                      <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                      <CardDescription className="text-xs">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(resource.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={resource.url}>
                          <span>
                            {t('resources.readMore') || "Ler mais"}
                          </span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Book className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-medium mt-4">
                  {t('resources.noResources') || "Nenhum recurso encontrado"}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {t('resources.tryAnotherSearch') || "Tente outra pesquisa ou categoria"}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}>
                  {t('resources.clearSearch') || "Limpar busca"}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Helper function to translate resource types
const getResourceType = (type: string, t: any) => {
  switch (type) {
    case "article":
      return t('resources.article') || "Artigo";
    case "video":
      return t('resources.video') || "Vídeo";
    case "case-study":
      return t('resources.caseStudy') || "Estudo de Caso";
    default:
      return type;
  }
};

export default ResourceCenterPage;
