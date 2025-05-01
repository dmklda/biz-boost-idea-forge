
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Building, Users, Shield } from "lucide-react";

const AboutUsPage = () => {
  const { t } = useTranslation();

  // Mock team data - show only the 2 actual team members
  const teamMembers = [
    {
      id: 1,
      name: t("aboutUs.team.member1.name"),
      role: t("aboutUs.team.member1.role"),
      bio: t("aboutUs.team.member1.bio"),
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 2,
      name: t("aboutUs.team.member2.name"),
      role: t("aboutUs.team.member2.role"),
      bio: t("aboutUs.team.member2.bio"),
      image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=300&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none"></div>
      
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 mb-24">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex h-6 items-center rounded-full bg-brand-purple/20 px-3 text-sm text-brand-purple">
              {t("aboutUs.tagline")}
            </div>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">{t("aboutUs.title")}</h1>
            <p className="text-xl text-muted-foreground">{t("aboutUs.subtitle")}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mb-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t("aboutUs.mission.title")}</h2>
              <p className="text-lg mb-6 text-muted-foreground">{t("aboutUs.mission.description1")}</p>
              <p className="text-lg text-muted-foreground">{t("aboutUs.mission.description2")}</p>
            </div>
            <div className="relative">
              <div className="bg-brand-purple/10 absolute inset-0 rounded-lg transform -rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=800&auto=format&fit=crop" 
                alt="Our mission"
                className="rounded-lg relative z-10 w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-card/30 backdrop-blur-sm py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">{t("aboutUs.values.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("aboutUs.values.subtitle")}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-6">
                  <Building className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("aboutUs.values.value1.title")}</h3>
                <p className="text-muted-foreground">{t("aboutUs.values.value1.description")}</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-6">
                  <Users className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("aboutUs.values.value2.title")}</h3>
                <p className="text-muted-foreground">{t("aboutUs.values.value2.description")}</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-purple/20 mb-6">
                  <Shield className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("aboutUs.values.value3.title")}</h3>
                <p className="text-muted-foreground">{t("aboutUs.values.value3.description")}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("aboutUs.team.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("aboutUs.team.subtitle")}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-muted-foreground mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
