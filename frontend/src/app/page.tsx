import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let status = "unreachable";
  try {
    status = (await api<{ status: string }>("/api/v1/health")).status;
  } catch {}
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Meetings</h1>
      <p className="mt-2">Backend status: {status}</p>
    </main>
  );
}
