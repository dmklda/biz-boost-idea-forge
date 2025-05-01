
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

const BlogPostPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data for blog posts - in a real app, this would be fetched from API
  const blogPosts = [
    {
      id: "1",
      title: t("blog.posts.post1.title"),
      content: t("blog.posts.post1.content"),
      date: t("blog.posts.post1.date"),
      category: t("blog.posts.post1.category"),
      image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "2",
      title: t("blog.posts.post2.title"),
      content: t("blog.posts.post2.content"),
      date: t("blog.posts.post2.date"),
      category: t("blog.posts.post2.category"),
      image: "https://images.unsplash.com/photo-1525073741840-12bd14257e02?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "3",
      title: t("blog.posts.post3.title"),
      content: t("blog.posts.post3.content"),
      date: t("blog.posts.post3.date"),
      category: t("blog.posts.post3.category"),
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "4",
      title: t("blog.posts.post4.title"),
      content: t("blog.posts.post4.content"),
      date: t("blog.posts.post4.date"),
      category: t("blog.posts.post4.category"),
      image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "5",
      title: t("blog.posts.post5.title"),
      content: t("blog.posts.post5.content"),
      date: t("blog.posts.post5.date"),
      category: t("blog.posts.post5.category"),
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: "6",
      title: t("blog.posts.post6.title"),
      content: t("blog.posts.post6.content"),
      date: t("blog.posts.post6.date"),
      category: t("blog.posts.post6.category"),
      image: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?q=80&w=700&auto=format&fit=crop"
    }
  ];

  const post = blogPosts.find(post => post.id === id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">{t("blog.postNotFound")}</h1>
        <Button onClick={() => navigate("/recursos/blog")}>{t("blog.backToBlog")}</Button>
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
          {t("blog.backToBlog")}
        </Button>

        <div className="max-w-4xl mx-auto">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
          />
          
          <div className="flex items-center justify-between mb-6">
            <Badge>{post.category}</Badge>
            <span className="text-sm text-muted-foreground">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground whitespace-pre-line mb-8">
              {post.content}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
