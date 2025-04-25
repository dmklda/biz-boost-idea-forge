
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
      description: t('features.viabilityAnalysis.description')
    },
    {
      icon: <Briefcase className="h-8 w-8 text-brand-purple" />,
      title: t('features.nameSloganPitch.title'),
      description: t('features.nameSloganPitch.description')
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-brand-green" />,
      title: t('features.modelEvaluation.title'),
      description: t('features.modelEvaluation.description')
    },
    {
      icon: <Target className="h-8 w-8 text-brand-blue" />,
      title: t('features.nichePersona.title'),
      description: t('features.nichePersona.description')
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-purple" />,
      title: t('features.mvpSuggestion.title'),
      description: t('features.mvpSuggestion.description')
    },
    {
      icon: <Code className="h-8 w-8 text-brand-green" />,
      title: t('features.recommendedStack.title'),
      description: t('features.recommendedStack.description')
    },
    {
      icon: <DollarSign className="h-8 w-8 text-brand-blue" />,
      title: t('features.monetizationPotential.title'),
      description: t('features.monetizationPotential.description')
    },
    {
      icon: <LineChart className="h-8 w-8 text-brand-purple" />,
      title: t('features.competitionDifferentials.title'),
      description: t('features.competitionDifferentials.description')
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">{t('features.title')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-inter">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="neo-card p-6"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-poppins">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 font-inter">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
