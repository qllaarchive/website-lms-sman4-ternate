import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const entries = await prisma.lmsEntry.findMany({
    where: { pub: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-bold text-xl text-gray-900">LMS SMAN 4 Ternate</span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            <button
              onClick={() => {
                // signOut handled client-side
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kelola LMS</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Tambah LMS
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="p-6 rounded-xl border border-gray-200 bg-white">
              <h2 className="font-semibold">{entry.name}</h2>
              <p className="text-sm text-gray-600">{entry.klass}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
