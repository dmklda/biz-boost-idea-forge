
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface FeaturedPostProps {
  post: BlogPost;
  onReadMore: (id: number) => void;
}

const FeaturedPost = ({ post, onReadMore }: FeaturedPostProps) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-60 md:h-full object-cover"
            />
          </div>
          <div className="md:w-3/5 p-6 md:p-8">
            <div className="flex justify-between items-center mb-2">
              <Badge>{post.category}</Badge>
              <span className="text-xs text-muted-foreground">{post.date}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h2>
            <p className="text-muted-foreground mb-6">{post.excerpt}</p>
            <Button onClick={() => onReadMore(post.id)}>
              <FileText className="mr-2 h-4 w-4" />
              {t("blog.readMore")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeaturedPost;
