import { AdminLoginForm } from "@/components/admin-login-form";
import { SohoHeader } from "@/components/soho-header";
import { redirectIfAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  await redirectIfAdminAuthenticated();

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-admin-shell">
        <div className="soho-admin-wrap">
          <div className="soho-admin-head soho-admin-head-clean">
            <div>
              <span className="soho-gallery-kicker">Tartalomkezelő</span>
              <h1>Védett admin</h1>
            </div>
          </div>

          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}

