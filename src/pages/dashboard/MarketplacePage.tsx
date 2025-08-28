import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Filter,
  Search,
  Heart,
  Eye,
  Clock,
  Award,
  Target
} from "lucide-react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { MarketplaceValidationCard } from "@/components/marketplace/MarketplaceValidationCard";
import { CreateValidationModal } from "@/components/marketplace/CreateValidationModal";

const MarketplacePage = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const { 
    validationRequests, 
    earlyAdopters, 
    isLoading,
    fetchValidationRequests,
    joinValidation
  } = useMarketplace();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoinValidation = async (validationId: string) => {
    await joinValidation(validationId);
  };

  const filteredRequests = validationRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getValidationTypeLabel = (type: string) => {
    const types = {
      'feedback': 'Feedback Geral',
      'survey': 'Pesquisa',
      'interview': 'Entrevista',
      'prototype_test': 'Teste de Protótipo'
    };
    return types[type as keyof typeof types] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'fintech': 'FinTech',
      'healthtech': 'HealthTech',
      'edtech': 'EdTech',
      'sustainability': 'Sustentabilidade',
      'ecommerce': 'E-commerce',
      'saas': 'SaaS'
    };
    return categories[category as keyof typeof categories] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
              Marketplace de Validação
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              Conecte-se com early adopters para validar suas ideias ou ajude empreendedores fornecendo feedback valioso.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Validações Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">24</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Early Adopters</p>
                    <p className="text-2xl font-bold text-green-600">156</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Feedbacks Hoje</p>
                    <p className="text-2xl font-bold text-purple-600">89</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-orange-600">94%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
              <TabsTrigger value="browse" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Explorar Validações
              </TabsTrigger>
              <TabsTrigger value="adopters" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Early Adopters
              </TabsTrigger>
              <TabsTrigger value="my-requests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                Minhas Solicitações
              </TabsTrigger>
            </TabsList>

            {/* Browse Validations Tab */}
            <TabsContent value="browse" className="mt-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar validações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="sustainability">Sustentabilidade</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Requests Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Carregando validações...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((request) => (
                    <MarketplaceValidationCard
                      key={request.id}
                      validation={request}
                      onJoin={handleJoinValidation}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Early Adopters Tab */}
            <TabsContent value="adopters" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earlyAdopters.map((adopter) => (
                  <Card key={adopter.id} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            {adopter.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{adopter.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{adopter.rating}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              ({adopter.completed_validations} validações)
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardDescription>{adopter.bio}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Áreas de Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {adopter.expertise_areas.map((area, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Pontos Totais:</span>
                          <span className="font-medium text-purple-600">{adopter.total_points}</span>
                        </div>
                        
                        <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                          Convidar para Validação
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Requests Tab */}
            <TabsContent value="my-requests" className="mt-6">
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação ainda</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Crie sua primeira solicitação de validação para conectar-se com early adopters.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Criar Solicitação
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Validation Modal */}
      <CreateValidationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default MarketplacePage;