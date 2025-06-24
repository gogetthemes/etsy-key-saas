import Link from "next/link";

export default function UpgradePage() {
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Тарифы</h1>
      <div className="mb-4 border rounded p-4">
        <div className="font-bold">Бесплатный</div>
        <div>До 10 ключей, без истории позиций</div>
      </div>
      <div className="mb-4 border rounded p-4">
        <div className="font-bold">PRO</div>
        <div>До 100 ключей, история, выгрузка</div>
        <button className="bg-blue-600 text-white rounded p-2 mt-2">Перейти на PRO (Stripe)</button>
      </div>
      <Link href="/dashboard" className="text-blue-600">Назад в Dashboard</Link>
    </main>
  );
} 