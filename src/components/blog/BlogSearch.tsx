
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BlogSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const BlogSearch = ({ searchQuery, setSearchQuery }: BlogSearchProps) => {
  return (
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
  );
};

export default BlogSearch;
