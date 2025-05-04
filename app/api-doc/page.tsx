//app/api-doc/page.tsx

import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="w-full max-w-screen-xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-600">Explorez et testez les endpoints de l'API Films Database</p>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ReactSwagger spec={spec} />
      </div>
    </section>
  );
}