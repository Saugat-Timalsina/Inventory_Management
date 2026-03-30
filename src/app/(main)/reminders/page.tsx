import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/business";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createReminderFromForm,
  markReminderDismissedForm,
  markReminderDoneForm,
} from "@/actions/reminders";
import { Badge } from "@/components/ui/badge";

export default async function RemindersPage() {
  const business = await getCurrentBusiness();
  if (!business) {
    return <p className="text-sm text-muted-foreground">Set up your shop first.</p>;
  }

  const reminders = await prisma.reminder.findMany({
    where: { businessId: business.id },
    orderBy: { dueAt: "asc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-sm text-muted-foreground">
          Follow-ups for payments, suppliers, and stock checks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createReminderFromForm} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Collect payment from…" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueAt">Due</Label>
              <Input id="dueAt" name="dueAt" type="datetime-local" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea id="message" name="message" rows={2} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save reminder</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reminders yet.</p>
        ) : (
          reminders.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.dueAt)}</p>
                  {r.message ? (
                    <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      r.status === "PENDING"
                        ? "warning"
                        : r.status === "DONE"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {r.status}
                  </Badge>
                  {r.status === "PENDING" ? (
                    <>
                      <form action={markReminderDoneForm} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Done
                        </Button>
                      </form>
                      <form action={markReminderDismissedForm} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </form>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
