
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const NewsletterSignup = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto mt-20">
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h3>
        <p className="text-muted-foreground mb-6">Get the latest insights and trends delivered to your inbox</p>
        <div className="flex max-w-md mx-auto gap-2 mb-4">
          <Input type="email" placeholder="Your email address" className="flex-grow" />
          <Button>Subscribe</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {t("blog.submitCasePromo")} 
          <Button variant="link" asChild className="p-0 h-auto">
            <Link to="/recursos/casos-de-sucesso">{t("blog.submitCaseLink")}</Link>
          </Button>
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
