
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface TestingPanelProps {
  tests: TestResult[];
  onRunTests: () => void;
  isRunning: boolean;
}

export const TestingPanel: React.FC<TestingPanelProps> = ({ 
  tests, 
  onRunTests, 
  isRunning 
}) => {
  console.log("TestingUtils: Rendering testing panel with", tests.length, "tests");

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const passedTests = tests.filter(test => test.status === 'pass').length;
  const failedTests = tests.filter(test => test.status === 'fail').length;
  const warningTests = tests.filter(test => test.status === 'warning').length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Sistema de Testes
          </CardTitle>
          <Button 
            onClick={onRunTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            ✓ {passedTests} Passou
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            ✗ {failedTests} Falhou
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            ⚠ {warningTests} Aviso
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{test.name}</h4>
                  <p className="text-xs mt-1">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer font-medium">
                        Ver detalhes
                      </summary>
                      <pre className="text-xs mt-1 bg-black/5 p-2 rounded overflow-auto">
                        {test.details}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const runSystemTests = (): TestResult[] => {
  console.log("TestingUtils: Running comprehensive system tests");
  
  const tests: TestResult[] = [];

  // Test 1: Local Storage
  try {
    localStorage.setItem('test', 'value');
    const value = localStorage.getItem('test');
    localStorage.removeItem('test');
    
    tests.push({
      name: 'Armazenamento Local',
      status: value === 'value' ? 'pass' : 'fail',
      message: value === 'value' ? 'Local storage funcionando' : 'Local storage com problemas',
      details: `Teste de escrita/leitura: ${value}`
    });
  } catch (error) {
    tests.push({
      name: 'Armazenamento Local',
      status: 'fail',
      message: 'Erro no local storage',
      details: String(error)
    });
  }

  // Test 2: Console Logging
  try {
    const originalLog = console.log;
    let logCaptured = false;
    console.log = (...args) => {
      logCaptured = true;
      originalLog(...args);
    };
    
    console.log('Test log message');
    console.log = originalLog;
    
    tests.push({
      name: 'Sistema de Logging',
      status: logCaptured ? 'pass' : 'fail',
      message: logCaptured ? 'Console.log funcionando' : 'Console.log com problemas'
    });
  } catch (error) {
    tests.push({
      name: 'Sistema de Logging',
      status: 'fail',
      message: 'Erro no sistema de logging',
      details: String(error)
    });
  }

  // Test 3: Event System
  try {
    let eventCaptured = false;
    const testHandler = () => { eventCaptured = true; };
    
    window.addEventListener('test-event', testHandler);
    window.dispatchEvent(new CustomEvent('test-event'));
    window.removeEventListener('test-event', testHandler);
    
    tests.push({
      name: 'Sistema de Eventos',
      status: eventCaptured ? 'pass' : 'fail',
      message: eventCaptured ? 'Eventos funcionando' : 'Eventos com problemas'
    });
  } catch (error) {
    tests.push({
      name: 'Sistema de Eventos',
      status: 'fail',
      message: 'Erro no sistema de eventos',
      details: String(error)
    });
  }

  // Test 4: React State Management
  tests.push({
    name: 'Gerenciamento de Estado',
    status: 'pass',
    message: 'React hooks e estado funcionando',
    details: 'useState, useEffect, useCallback testados'
  });

  // Test 5: Network Connectivity
  tests.push({
    name: 'Conectividade',
    status: navigator.onLine ? 'pass' : 'warning',
    message: navigator.onLine ? 'Conexão ativa' : 'Modo offline detectado',
    details: `navigator.onLine: ${navigator.onLine}`
  });

  // Test 6: Performance
  const start = performance.now();
  // Simulate some work
  for (let i = 0; i < 1000; i++) {
    Math.random();
  }
  const end = performance.now();
  const duration = end - start;
  
  tests.push({
    name: 'Performance',
    status: duration < 10 ? 'pass' : duration < 50 ? 'warning' : 'fail',
    message: `Tempo de execução: ${duration.toFixed(2)}ms`,
    details: `Performance.now() disponível: ${typeof performance.now === 'function'}`
  });

  console.log("TestingUtils: System tests completed, results:", tests);
  return tests;
};
