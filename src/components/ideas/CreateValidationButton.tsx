import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useMarketplace } from "@/hooks/useMarketplace";
import { CreateValidationModal } from "@/components/marketplace/CreateValidationModal";

interface CreateValidationButtonProps {
  ideaId: string;
  ideaTitle?: string;
  className?: string;
}

export const CreateValidationButton = ({ 
  ideaId, 
  ideaTitle, 
  className 
}: CreateValidationButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className={className}
      >
        <Target className="w-4 h-4 mr-2" />
        Criar Validação
      </Button>

      <CreateValidationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        ideaId={ideaId}
      />
    </>
  );
};