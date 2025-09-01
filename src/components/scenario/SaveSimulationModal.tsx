import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

interface SaveSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isLoading?: boolean;
}

const SaveSimulationModal = ({ isOpen, onClose, onSave, isLoading = false }: SaveSimulationModalProps) => {
  const [simulationName, setSimulationName] = useState("");

  const handleSave = async () => {
    if (!simulationName.trim()) return;
    
    await onSave(simulationName.trim());
    setSimulationName("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && simulationName.trim() && !isLoading) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Salvar Simulação
          </DialogTitle>
          <DialogDescription>
            Dê um nome à sua simulação para encontrá-la facilmente depois.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="simulation-name">Nome da Simulação</Label>
            <Input
              id="simulation-name"
              placeholder="Ex: Análise Q1 2024, Cenário Pessimista..."
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!simulationName.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSimulationModal;