import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

interface AuthGuardProps {
  onProceed?: () => void;
  children: React.ReactNode;
  message?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  onProceed, 
  children,
  message = "Você precisa estar logado para usar esta funcionalidade"
}) => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleFeatureAccess = () => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, proceed with the feature
    if (onProceed) {
      onProceed();
    }
  };

  const handleLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setShowAuthModal(false);
    navigate('/register');
  };

  // Clone children and add onClick handler
  const childrenWithProps = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child, { onClick: handleFeatureAccess } as any)
      : child
  );

  return (
    <>
      {childrenWithProps}
      
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-brand-purple" />
              Login Necessário
            </DialogTitle>
            <DialogDescription>
              {message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="cursor-pointer transition-all hover:scale-[1.02]" onClick={handleLogin}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LogIn className="h-5 w-5 text-brand-purple" />
                  Fazer Login
                </CardTitle>
                <CardDescription>
                  Já tem uma conta? Entre para continuar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-all hover:scale-[1.02]" onClick={handleRegister}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-brand-purple" />
                  Criar Conta
                </CardTitle>
                <CardDescription>
                  Novo por aqui? Registre-se gratuitamente
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAuthModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};