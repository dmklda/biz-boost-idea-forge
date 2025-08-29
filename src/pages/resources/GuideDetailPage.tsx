import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen } from "lucide-react";
import { useGuides, Guide } from "../../hooks/useGuides";
import { Loader } from "@/components/ui/loader";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

const GuideDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getGuideBySlug } = useGuides();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchGuide();
    }
  }, [slug, getGuideBySlug]);

  const fetchGuide = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const data = await getGuideBySlug(slug);
      if (data) {
        setGuide(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
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

  if (notFound || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Guia não encontrado</h1>
            <Button onClick={() => navigate("/recursos/guias")}>Voltar aos Guias</Button>
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
          onClick={() => navigate("/recursos/guias")}
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar aos Guias
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-brand-purple/20 mb-4">
            <BookOpen className="h-8 w-8 text-brand-purple" />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">{guide.category}</span>
            <span className="text-sm bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full">
              {guide.level}
            </span>
            {guide.reading_time && (
              <span className="text-sm text-muted-foreground">
                {guide.reading_time} min de leitura
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{guide.title}</h1>
          
          {guide.description && (
            <p className="text-lg text-muted-foreground mb-8">{guide.description}</p>
          )}
          
          <MarkdownRenderer content={guide.content} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideDetailPage;