import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FileText } from "lucide-react";

const BlogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  // Mock data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: t("blog.posts.post1.title"),
      excerpt: t("blog.posts.post1.excerpt"),
      content: t("blog.posts.post1.content"),
      date: t("blog.posts.post1.date"),
      category: t("blog.posts.post1.category"),
      image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 2,
      title: t("blog.posts.post2.title"),
      excerpt: t("blog.posts.post2.excerpt"),
      content: t("blog.posts.post2.content"),
      date: t("blog.posts.post2.date"),
      category: t("blog.posts.post2.category"),
      image: "https://images.unsplash.com/photo-1525073741840-12bd14257e02?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 3,
      title: t("blog.posts.post3.title"),
      excerpt: t("blog.posts.post3.excerpt"),
      content: t("blog.posts.post3.content"),
      date: t("blog.posts.post3.date"),
      category: t("blog.posts.post3.category"),
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 4,
      title: t("blog.posts.post4.title"),
      excerpt: t("blog.posts.post4.excerpt"),
      content: t("blog.posts.post4.content"),
      date: t("blog.posts.post4.date"),
      category: t("blog.posts.post4.category"),
      image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 5,
      title: t("blog.posts.post5.title"),
      excerpt: t("blog.posts.post5.excerpt"),
      content: t("blog.posts.post5.content"),
      date: t("blog.posts.post5.date"),
      category: t("blog.posts.post5.category"),
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=700&auto=format&fit=crop"
    },
    {
      id: 6,
      title: t("blog.posts.post6.title"),
      excerpt: t("blog.posts.post6.excerpt"),
      content: t("blog.posts.post6.content"),
      date: t("blog.posts.post6.date"),
      category: t("blog.posts.post6.category"),
      image: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?q=80&w=700&auto=format&fit=crop"
    }
  ];

  // Filter posts based on search query
  const filteredPosts = searchQuery 
    ? blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blogPosts;

  // Featured post is the first one
  const featuredPost = blogPosts[0];
  // Regular posts exclude the featured post
  const regularPosts = filteredPosts.filter(post => post.id !== featuredPost.id);

  const togglePostExpand = (id: number) => {
    if (expandedPost === id) {
      setExpandedPost(null);
    } else {
      setExpandedPost(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("blog.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("blog.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </div>
        
        {/* Search and category filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow max-w-md">
              <Input 
                type="text" 
                placeholder="Search articles..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Idea Validation</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Market Analysis</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Funding</Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Technology</Badge>
            </div>
          </div>
        </div>
        
        {!searchQuery && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-60 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-3/5 p-6 md:p-8">
                  <div className="flex justify-between items-center mb-2">
                    <Badge>{featuredPost.category}</Badge>
                    <span className="text-xs text-muted-foreground">{featuredPost.date}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  <Button onClick={() => navigate(`/recursos/blog/${featuredPost.id}`)}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("blog.readMore")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {regularPosts.map((post) => (
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/recursos/blog/${post.id}`)}
                  >
                    {t("blog.readMore")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {regularPosts.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline">{t("blog.loadMore")}</Button>
            </div>
          )}
          
          {regularPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search query</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </div>
        
        {/* Newsletter signup */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h3>
            <p className="text-muted-foreground mb-6">Get the latest insights and trends delivered to your inbox</p>
            <div className="flex max-w-md mx-auto gap-2">
              <Input type="email" placeholder="Your email address" className="flex-grow" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
