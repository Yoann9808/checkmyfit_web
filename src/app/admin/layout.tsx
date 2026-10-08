import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-chene-dore pb-4">
        <p className="label text-noyer">Administration</p>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
