
import { useTranslation } from "react-i18next";
import SubmitSuccessCase from "./SubmitSuccessCase";

const BlogHeader = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("blog.tagline")}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">{t("blog.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <SubmitSuccessCase />
        </div>
      </div>
    </div>
  );
};

export default BlogHeader;
