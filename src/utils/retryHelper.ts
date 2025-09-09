interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

export const isRetryableError = (error: Error): boolean => {
  const retryableMessages = [
    'network error',
    'timeout',
    'connection refused',
    'rate limit',
    'server error',
    'internal server error',
    'bad gateway',
    'service unavailable',
    'gateway timeout'
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
};

export const getErrorMessage = (error: Error): string => {
  if (error.message.includes('rate limit')) {
    return 'Muitas solicitações. Aguarde um momento e tente novamente.';
  }
  
  if (error.message.includes('network') || error.message.includes('timeout')) {
    return 'Problema de conexão. Verifique sua internet e tente novamente.';
  }
  
  if (error.message.includes('server error') || error.message.includes('internal')) {
    return 'Erro no servidor. Nossa equipe foi notificada. Tente novamente em alguns minutos.';
  }
  
  if (error.message.includes('credits') || error.message.includes('créditos')) {
    return 'Créditos insuficientes. Adquira mais créditos para continuar.';
  }
  
  return error.message || 'Erro inesperado. Tente novamente.';
};