
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
}

interface BlogPostCardProps {
  post: BlogPost;
  onReadMore: (id: number) => void;
}

const BlogPostCard = ({ post, onReadMore }: BlogPostCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
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
          onClick={() => onReadMore(post.id)}
        >
          {t("blog.readMore")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
