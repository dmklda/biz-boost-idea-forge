
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  tags: string[];
  published_at: string;
}

interface BlogPostCardProps {
  post: BlogPost;
  onReadMore: (slug: string) => void;
}

const BlogPostCard = ({ post, onReadMore }: BlogPostCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
      {post.featured_image_url && (
        <img 
          src={post.featured_image_url} 
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1 flex-wrap">
            {post.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString('pt-BR')}
          </span>
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
          onClick={() => onReadMore(post.slug)}
        >
          {t("blog.readMore")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
