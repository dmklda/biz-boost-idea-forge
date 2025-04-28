
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { StarIcon } from "lucide-react";
import { useState } from "react";

const Testimonials = () => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const testimonials = [
    {
      quote: t('testimonials.quote1'),
      author: t('testimonials.author1'),
      role: t('testimonials.role1'),
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&auto=format&fit=crop&q=80",
      stars: 5
    },
    {
      quote: t('testimonials.quote2'),
      author: t('testimonials.author2'),
      role: t('testimonials.role2'),
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&auto=format&fit=crop&q=80",
      stars: 5
    },
    {
      quote: t('testimonials.quote3'),
      author: t('testimonials.author3'),
      role: t('testimonials.role3'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&auto=format&fit=crop&q=80",
      stars: 5
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-premium opacity-70"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
            {t('testimonials.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className={`glassmorphism backdrop-blur-xl border-glow transition-all duration-300 transform ${
                hoveredIndex === index ? 'scale-[1.03] shadow-glow-sm' : 'scale-100'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-6 flex justify-between">
                    <svg width="45" height="36" className="text-primary/20" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 0C6.04662 0 0 6.04662 0 13.5C0 20.9534 6.04662 27 13.5 27H18V36H9C4.02944 36 0 31.9706 0 27V13.5C0 6.04662 6.04662 0 13.5 0ZM40.5 0C33.0466 0 27 6.04662 27 13.5C27 20.9534 33.0466 27 40.5 27H45V36H36C31.0294 36 27 31.9706 27 27V13.5C27 6.04662 33.0466 0 40.5 0Z" fill="currentColor" />
                    </svg>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-foreground mb-8 flex-grow text-lg">{testimonial.quote}</p>
                  
                  <div className="flex items-center mt-auto">
                    <Avatar className="h-12 w-12 mr-4 border-2 border-brand-purple/30">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback className="bg-brand-purple/20 text-brand-purple">
                        {testimonial.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
