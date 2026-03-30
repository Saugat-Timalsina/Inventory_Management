import Link from "next/link";
import { createCustomerFromForm } from "@/actions/parties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">New customer</h1>
          <p className="text-sm text-muted-foreground">
            Save name and mobile for quick call / WhatsApp.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/customers">Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Add a party to your customer khata.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerFromForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" name="mobile" placeholder="98xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <Button type="submit" className="w-full">
              Save customer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
