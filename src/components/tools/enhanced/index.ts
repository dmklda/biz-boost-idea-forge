/**
 * Ferramentas Melhoradas com Responsividade e Design Mobile-First
 * 
 * Este arquivo exporta as versões melhoradas das ferramentas da plataforma,
 * que foram redesenhadas para serem totalmente responsivas e seguir o princípio
 * de mobile-first design.
 * 
 * Para usar estas versões melhoradas, importe-as diretamente deste arquivo
 * ou substitua as importações existentes nas páginas que usam as ferramentas.
 */

// Exportando as ferramentas melhoradas
export { RoadmapGeneratorModalEnhanced } from './RoadmapGeneratorModalEnhanced';
export { PRDMVPGeneratorModalEnhanced } from './PRDMVPGeneratorModalEnhanced';
export { InvestmentSimulatorModalEnhanced } from './InvestmentSimulatorModalEnhanced';
export { StartupKitModalEnhanced } from './StartupKitModalEnhanced';
export { RevenueForecastModalEnhanced } from './RevenueForecastModalEnhanced';
export { ColorPaletteModalEnhanced } from './ColorPaletteModalEnhanced';
export { BusinessModelCanvasModalEnhanced } from './BusinessModelCanvasModalEnhanced';

// Exemplo de como substituir as importações nas páginas:
// 
// Antes:
// import { RoadmapGeneratorModal } from "@/components/tools/RoadmapGeneratorModal";
// 
// Depois (opção 1 - importação direta):
// import { RoadmapGeneratorModalEnhanced as RoadmapGeneratorModal } from "@/components/tools/enhanced/RoadmapGeneratorModalEnhanced";
// 
// Depois (opção 2 - importação via index):
// import { RoadmapGeneratorModalEnhanced as RoadmapGeneratorModal } from "@/components/tools/enhanced";