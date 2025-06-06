
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, FileText, Lightbulb, Trophy } from "lucide-react";
import { useState } from "react";
import { LogoGeneratorModal } from "@/components/tools/LogoGeneratorModal";
import { PRDMVPGeneratorModal } from "@/components/tools/PRDMVPGeneratorModal";
import { useNavigate } from "react-router-dom";

const ToolsPage = () => {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);
  const navigate = useNavigate();

  const tools = [
    {
      title: "Gerador de Logo",
      description: "Crie logos profissionais para sua startup usando IA",
      icon: Palette,
      action: () => setIsLogoModalOpen(true),
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "PRD/MVP Generator",
      description: "Gere documentos técnicos detalhados para sua ideia",
      icon: FileText,
      action: () => setIsPRDModalOpen(true),
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Gerador de Nomes",
      description: "Encontre o nome perfeito para sua startup",
      icon: Lightbulb,
      action: () => console.log("Coming soon"),
      color: "from-green-500 to-emerald-500",
      disabled: true
    },
    {
      title: "Gamificação",
      description: "Veja seu progresso, conquistas e nível atual",
      icon: Trophy,
      action: () => navigate('/dashboard/gamificacao'),
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ferramentas</h1>
        <p className="text-muted-foreground">
          Utilize nossas ferramentas de IA para acelerar o desenvolvimento da sua startup
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-5`} />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color}`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={tool.action} 
                className="w-full"
                disabled={tool.disabled}
              >
                {tool.disabled ? "Em breve" : "Usar ferramenta"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <LogoGeneratorModal 
        isOpen={isLogoModalOpen} 
        onClose={() => setIsLogoModalOpen(false)} 
      />
      <PRDMVPGeneratorModal 
        isOpen={isPRDModalOpen} 
        onClose={() => setIsPRDModalOpen(false)} 
      />
    </div>
  );
};

export default ToolsPage;
