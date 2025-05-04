// app/api-doc/react-swagger.tsx

'use client';

import { useEffect, useState } from 'react';

// Création d'un composant wrapper simple pour Swagger UI
function ReactSwagger({ spec }: { spec: Record<string, any> }) {
  const [SwaggerUIComponent, setSwaggerUIComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ajout du CSS de Swagger UI
    const swaggerStyles = document.createElement('link');
    swaggerStyles.rel = 'stylesheet';
    swaggerStyles.href = 'https://unpkg.com/swagger-ui-react/swagger-ui.css';
    document.head.appendChild(swaggerStyles);

    // Import dynamique pour éviter les problèmes de prérendu
    const loadSwaggerUI = async () => {
      try {
        const SwaggerUI = (await import('swagger-ui-react')).default;
        setSwaggerUIComponent(() => SwaggerUI);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement de Swagger UI:', error);
        setIsLoading(false);
      }
    };

    loadSwaggerUI();

    return () => {
      // Nettoyage
      if (swaggerStyles.parentNode) {
        document.head.removeChild(swaggerStyles);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-6 w-32 bg-gray-300 rounded mx-auto"></div>
          <div className="h-4 w-64 bg-gray-300 rounded mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de la documentation API...</p>
        </div>
      </div>
    );
  }

  if (!SwaggerUIComponent) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-red-700">Impossible de charger la documentation Swagger UI.</p>
        <p className="text-red-600 text-sm mt-2">Vérifiez que toutes les dépendances sont installées correctement.</p>
      </div>
    );
  }

  // Wrapper de sécurité pour éviter les erreurs React
  return (
    <div className="swagger-ui-container">
      <SwaggerUIComponent 
        spec={spec} 
        docExpansion="list" 
        defaultModelsExpandDepth={-1}
      />
    </div>
  );
}

export default ReactSwagger;