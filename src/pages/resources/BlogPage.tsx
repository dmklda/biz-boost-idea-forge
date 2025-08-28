
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BlogHeader from "../../components/blog/BlogHeader";
import BlogSearch from "../../components/blog/BlogSearch";
import FeaturedPost from "../../components/blog/FeaturedPost";
import BlogPostsGrid from "../../components/blog/BlogPostsGrid";
import NewsletterSignup from "../../components/blog/NewsletterSignup";
import { useBlogPosts } from "../../hooks/useBlogPosts";
import { Loader } from "@/components/ui/loader";

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { blogPosts, loading, error } = useBlogPosts();

  // Filter posts based on search query
  const filteredPosts = searchQuery 
    ? blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : blogPosts;

  // Featured post is the first featured one or the first one
  const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
  // Regular posts exclude the featured post
  const regularPosts = filteredPosts.filter(post => post.id !== featuredPost?.id);

  // Function to handle blog post navigation
  const handleNavigateToBlogPost = (postSlug: string) => {
    if (postSlug === "clear") {
      // Clear search case
      setSearchQuery("");
      return;
    }
    
    console.log(`Navigating to blog post: ${postSlug}`);
    navigate(`/recursos/blog/${postSlug}`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Erro ao carregar posts: {error}</p>
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
        <BlogHeader />
        <BlogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {!searchQuery && featuredPost && <FeaturedPost post={featuredPost} onReadMore={handleNavigateToBlogPost} />}
        
        <div className="max-w-4xl mx-auto">
          <BlogPostsGrid posts={regularPosts} onReadMore={handleNavigateToBlogPost} />
        </div>
        
        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
