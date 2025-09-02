
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

export function getRevenueModelDisplayName(revenueModel: string): string {
  const revenueModelNames: { [key: string]: string } = {
    'subscription': 'Assinatura',
    'Subscription': 'Assinatura',
    'freemium': 'Freemium',
    'Freemium': 'Freemium',
    'marketplace': 'Marketplace',
    'Marketplace': 'Marketplace',
    'advertising': 'Publicidade',
    'Advertising': 'Publicidade',
    'one_time': 'Pagamento Único',
    'One-time': 'Pagamento Único',
    'One Time': 'Pagamento Único',
    'Commission': 'Comissão',
    'commission': 'Comissão',
    'SaaS': 'Assinatura',
    'B2B SaaS': 'Assinatura',
    'B2C SaaS': 'Assinatura'
  };
  
  return revenueModelNames[revenueModel] || revenueModel;
}
