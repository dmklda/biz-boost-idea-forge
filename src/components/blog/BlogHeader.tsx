
import { useTranslation } from "react-i18next";

const BlogHeader = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
          {t("blog.tagline")}
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("blog.title")}</h1>
      <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
    </div>
  );
};

export default BlogHeader;
