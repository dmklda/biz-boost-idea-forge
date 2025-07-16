
import { useTranslation } from 'react-i18next';
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const HeroAvatars = () => {
  const { t } = useTranslation();
  
  const trustAvatars = [
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&h=64&auto=format&fit=crop", name: "Alex K." },
    { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=64&h=64&auto=format&fit=crop", name: "Maria S." },
    { src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=64&h=64&auto=format&fit=crop", name: "John D." },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&h=64&auto=format&fit=crop", name: "Sara M." }
  ];

  return (
    <div className="flex items-center gap-4 mb-12">
      <div className="flex -space-x-3">
        {trustAvatars.map((avatar, index) => (
          <Avatar 
            key={index} 
            className="border-2 border-background dark:border-gray-900 w-8 h-8 md:w-10 md:h-10 transition-transform hover:translate-y-[-2px] hover:scale-110"
          >
            <AvatarImage src={avatar.src} alt={avatar.name} />
            <AvatarFallback>{avatar.name[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex items-center">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-brand-purple text-brand-purple" />
          ))}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">{t('hero.trustedBy', t('hero.trustedByFallback', 'Utilizado por +5.000 empreendedores'))}</span>
      </div>
    </div>
  );
};

export default HeroAvatars;
