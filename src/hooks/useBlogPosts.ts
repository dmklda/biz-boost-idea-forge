
import { useTranslation } from "react-i18next";

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
}

export const useBlogPosts = () => {
  const { t } = useTranslation();
  
  // Mock data for blog posts
  const blogPosts: BlogPost[] = [
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

  return blogPosts;
};
