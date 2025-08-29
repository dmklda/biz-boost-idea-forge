import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { useBlogPosts, BlogPost } from "../../hooks/useBlogPosts";
import { Loader } from "@/components/ui/loader";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getBlogPostBySlug } = useBlogPosts();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, getBlogPostBySlug]);

  const fetchPost = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const data = await getBlogPostBySlug(slug);
      if (data) {
        setPost(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
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

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
            <Button onClick={() => navigate("/recursos/blog")}>Voltar ao Blog</Button>
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
          onClick={() => navigate("/recursos/blog")}
          className="mb-6 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar ao Blog
        </Button>

        <div className="max-w-4xl mx-auto">
          {post.featured_image_url && (
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            />
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(post.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>
          
          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>
          )}
          
          <MarkdownRenderer content={post.content} />

          {post.reading_time && (
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Tempo de leitura: {post.reading_time} minutos
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;