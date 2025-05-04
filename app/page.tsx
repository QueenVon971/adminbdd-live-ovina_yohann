import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-center mb-6">Films Database API</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Documentation API</h2>
              <p className="text-gray-600 mb-3">
                Consultez notre documentation Swagger pour comprendre et tester les endpoints de l'API.
              </p>
              <Link 
                href="/api-doc" 
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center transition-colors"
              >
                Accéder à la documentation
              </Link>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Démo de l'application</h2>
              <p className="text-gray-600 mb-3">
                Découvrez une démo de notre application utilisant MongoDB.
              </p>
              <Link 
                href="/app-demo" 
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded text-center transition-colors"
              >
                Voir la démo
              </Link>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">API Endpoint</h2>
              <p className="text-gray-600 mb-3">
                Accédez directement à l'API des films.
              </p>
              <Link 
                href="/api/movies" 
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded text-center transition-colors"
              >
                Liste des films
              </Link>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-center text-gray-600">
            Développé avec Next.js et MongoDB
          </p>
        </div>
      </div>
    </div>
  );
}
