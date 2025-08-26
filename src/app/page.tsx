import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js 14 App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            TypeScript + Tailwind CSS + App Router
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Project Structure
            </h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✅ Next.js 14 with App Router</li>
              <li>✅ TypeScript configuration</li>
              <li>✅ Tailwind CSS setup</li>
              <li>✅ ESLint + Prettier</li>
              <li>✅ Components directory</li>
              <li>✅ Lib directory</li>
              <li>✅ Types directory</li>
              <li>✅ Utils directory</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
