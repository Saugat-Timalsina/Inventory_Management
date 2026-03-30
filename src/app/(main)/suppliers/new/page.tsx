import Link from "next/link";
import { createSupplierFromForm } from "@/actions/parties";
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

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">New supplier</h1>
          <p className="text-sm text-muted-foreground">
            Track purchases and payments with each vendor.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/suppliers">Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Add a supplier for purchase bills.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSupplierFromForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" name="mobile" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <Button type="submit" className="w-full">
              Save supplier
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
