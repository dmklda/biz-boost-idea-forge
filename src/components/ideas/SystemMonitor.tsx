
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Wifi, Zap, RefreshCw } from 'lucide-react';

interface SystemMetrics {
  memoryUsage: number;
  loadTime: number;
  apiLatency: number;
  connectionStatus: 'online' | 'offline';
  lastUpdate: string;
}

export const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    apiLatency: 0,
    connectionStatus: 'online',
    lastUpdate: new Date().toLocaleTimeString()
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  console.log("SystemMonitor: Component rendered, monitoring:", isMonitoring);

  const updateMetrics = async () => {
    console.log("SystemMonitor: Updating metrics");
    
    try {
      const startTime = performance.now();
      
      // Simulate API call to measure latency
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const endTime = performance.now();
      const apiLatency = endTime - startTime;

      // Get memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? 
        (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100 : 0;

      const newMetrics: SystemMetrics = {
        memoryUsage: Math.round(memoryUsage),
        loadTime: Math.round(performance.now()),
        apiLatency: Math.round(apiLatency),
        connectionStatus: navigator.onLine ? 'online' : 'offline',
        lastUpdate: new Date().toLocaleTimeString()
      };

      console.log("SystemMonitor: Metrics updated:", newMetrics);
      setMetrics(newMetrics);
    } catch (error) {
      console.error("SystemMonitor: Error updating metrics:", error);
    }
  };

  useEffect(() => {
    if (isMonitoring) {
      console.log("SystemMonitor: Starting monitoring interval");
      updateMetrics();
      const interval = setInterval(updateMetrics, 5000);
      
      return () => {
        console.log("SystemMonitor: Clearing monitoring interval");
        clearInterval(interval);
      };
    }
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    console.log("SystemMonitor: Toggling monitoring from", isMonitoring, "to", !isMonitoring);
    setIsMonitoring(!isMonitoring);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor do Sistema
          </CardTitle>
          <Button 
            onClick={toggleMonitoring}
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Monitorando
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Iniciar Monitor
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Última atualização: {metrics.lastUpdate}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Memory Usage */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Uso de Memória</p>
              <Badge 
                variant="outline" 
                className={getStatusColor(metrics.memoryUsage, { good: 50, warning: 80 })}
              >
                {metrics.memoryUsage}%
              </Badge>
            </div>
          </div>

          {/* Load Time */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Zap className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Tempo de Carregamento</p>
              <Badge 
                variant="outline" 
                className={getStatusColor(metrics.loadTime, { good: 1000, warning: 3000 })}
              >
                {metrics.loadTime}ms
              </Badge>
            </div>
          </div>

          {/* API Latency */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium">Latência da API</p>
              <Badge 
                variant="outline" 
                className={getStatusColor(metrics.apiLatency, { good: 50, warning: 200 })}
              >
                {metrics.apiLatency}ms
              </Badge>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Wifi className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Conexão</p>
              <Badge 
                variant="outline" 
                className={metrics.connectionStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              >
                {metrics.connectionStatus === 'online' ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Dicas de Performance</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Mantenha o uso de memória abaixo de 80%</li>
            <li>• Latência da API deve ser menor que 200ms</li>
            <li>• Verifique a conexão se houver problemas de carregamento</li>
            <li>• Use o console do navegador para logs detalhados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
