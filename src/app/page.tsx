import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-gray-900">
            LMS SMAN 4 Ternate
          </Link>
          <div className="space-x-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8">Selamat Datang</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Matematika", color: "bg-blue-100 text-blue-700" },
            { name: "Fisika", color: "bg-purple-100 text-purple-700" },
            { name: "Sejarah", color: "bg-red-100 text-red-700" },
          ].map((mapel) => (
            <div key={mapel.name} className="p-6 rounded-xl border border-gray-200 {mapel.color}">
              <h2 className="font-semibold">{mapel.name}</h2>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
