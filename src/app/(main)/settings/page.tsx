import { getCurrentBusiness } from "@/lib/business";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Business profile used on invoices and reports.
        </p>
      </div>
      <SettingsForm
        initial={
          business
            ? {
                name: business.name,
                phone: business.phone ?? "",
                address: business.address ?? "",
              }
            : null
        }
      />
    </div>
  );
}
