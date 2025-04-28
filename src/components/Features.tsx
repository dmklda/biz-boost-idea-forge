
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Briefcase, 
  Code, 
  DollarSign, 
  LineChart 
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: <Lightbulb className="h-8 w-8 text-brand-blue" />,
      title: t('features.viabilityAnalysis.title'),
      description: t('features.viabilityAnalysis.description'),
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      icon: <Briefcase className="h-8 w-8 text-brand-purple" />,
      title: t('features.nameSloganPitch.title'),
      description: t('features.nameSloganPitch.description'),
      gradient: "from-purple-500/20 to-purple-600/30"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-brand-green" />,
      title: t('features.modelEvaluation.title'),
      description: t('features.modelEvaluation.description'),
      gradient: "from-green-500/20 to-green-600/30"
    },
    {
      icon: <Target className="h-8 w-8 text-brand-blue" />,
      title: t('features.nichePersona.title'),
      description: t('features.nichePersona.description'),
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-purple" />,
      title: t('features.mvpSuggestion.title'),
      description: t('features.mvpSuggestion.description'),
      gradient: "from-purple-500/20 to-purple-600/30"
    },
    {
      icon: <Code className="h-8 w-8 text-brand-green" />,
      title: t('features.recommendedStack.title'),
      description: t('features.recommendedStack.description'),
      gradient: "from-green-500/20 to-green-600/30"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-brand-blue" />,
      title: t('features.monetizationPotential.title'),
      description: t('features.monetizationPotential.description'),
      gradient: "from-blue-500/20 to-blue-600/30"
    },
    {
      icon: <LineChart className="h-8 w-8 text-brand-purple" />,
      title: t('features.competitionDifferentials.title'),
      description: t('features.competitionDifferentials.description'),
      gradient: "from-purple-500/20 to-purple-600/30"
    }
  ];

  return (
    <section id="beneficios" className="py-24 relative bg-gradient-premium">
      <div className="absolute inset-0 bg-mesh-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full mb-4">
            {t('features.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-poppins mb-6 bg-gradient-to-r from-brand-purple to-indigo-500 bg-clip-text text-transparent">
            {t('features.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-inter">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card-hover-effect backdrop-blur-sm border border-white/10 dark:border-white/5 shadow-md rounded-xl overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 transition-opacity group-hover:opacity-50`}></div>
              
              <div className="p-6 relative">
                <div className="w-14 h-14 mb-6 rounded-xl flex items-center justify-center bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 font-poppins group-hover:text-gradient-premium transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-inter">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
