import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { useSuccessCases, SuccessCase } from "../../hooks/useSuccessCases";
import { Loader } from "@/components/ui/loader";

const SuccessCaseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getSuccessCaseBySlug } = useSuccessCases();
  const [caseItem, setCaseItem] = useState<SuccessCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCase();
    }
  }, [slug, getSuccessCaseBySlug]);

  const fetchCase = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const data = await getSuccessCaseBySlug(slug);
      if (data) {
        setCaseItem(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching success case:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !caseItem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Caso não encontrado</h1>
            <Button onClick={() => navigate("/recursos/casos-de-sucesso")}>Voltar aos Casos</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/recursos/casos-de-sucesso")}
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar aos Casos
        </Button>

        <div className="max-w-4xl mx-auto">
          {(caseItem.company_logo_url || caseItem.founder_photo_url) && (
            <img 
              src={caseItem.company_logo_url || caseItem.founder_photo_url || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=700&auto=format&fit=crop"} 
              alt={caseItem.company_name}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            />
          )}
          
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-brand-purple/20 mb-6">
            <Users className="h-8 w-8 text-brand-purple" />
          </div>

          <div className="mb-4">
            <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">{caseItem.industry}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{caseItem.company_name}</h1>
          
          {caseItem.founder_name && (
            <p className="text-lg text-muted-foreground mb-6">
              Fundador: {caseItem.founder_name}
            </p>
          )}
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Sobre a Empresa</h2>
              <p className="whitespace-pre-line">{caseItem.description}</p>
            </div>

            {caseItem.challenge && (
              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-4">Desafio</h3>
                <p className="whitespace-pre-line">{caseItem.challenge}</p>
              </div>
            )}

            {caseItem.solution && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Solução</h3>
                <p className="whitespace-pre-line">{caseItem.solution}</p>
              </div>
            )}
            
            <div className="bg-secondary/50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Resultados</h3>
              <p className="whitespace-pre-line">{caseItem.results}</p>
            </div>

            {caseItem.metrics && (
              <div className="bg-card/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Métricas</h3>
                <pre className="text-sm">{JSON.stringify(caseItem.metrics, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessCaseDetailPage;