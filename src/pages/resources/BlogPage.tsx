
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BlogPage = () => {
  const { t } = useTranslation();

  // Mock data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: t("blog.posts.post1.title"),
      excerpt: t("blog.posts.post1.excerpt"),
      date: t("blog.posts.post1.date"),
      category: t("blog.posts.post1.category"),
      image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 2,
      title: t("blog.posts.post2.title"),
      excerpt: t("blog.posts.post2.excerpt"),
      date: t("blog.posts.post2.date"),
      category: t("blog.posts.post2.category"),
      image: "https://images.unsplash.com/photo-1525073741840-12bd14257e02?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 3,
      title: t("blog.posts.post3.title"),
      excerpt: t("blog.posts.post3.excerpt"),
      date: t("blog.posts.post3.date"),
      category: t("blog.posts.post3.category"),
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=700&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("blog.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("blog.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post) => (
            <Card key={post.id} className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">{t("blog.readMore")}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline">{t("blog.loadMore")}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
