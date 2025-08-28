
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import BlogPostCard from "./BlogPostCard";
import { BlogPost } from "../../hooks/useBlogPosts";

interface BlogPostsGridProps {
  posts: BlogPost[];
  onReadMore: (slug: string) => void;
}

const BlogPostsGrid = ({ posts, onReadMore }: BlogPostsGridProps) => {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No articles found</h3>
        <p className="text-muted-foreground">Try adjusting your search query</p>
        <Button variant="outline" className="mt-4" onClick={() => onReadMore("clear")}>
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {posts.map((post) => (
          <BlogPostCard 
            key={post.id} 
            post={post} 
            onReadMore={onReadMore} 
          />
        ))}
      </div>
      
      {posts.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">{t("blog.loadMore")}</Button>
        </div>
      )}
    </>
  );
};

export default BlogPostsGrid;
