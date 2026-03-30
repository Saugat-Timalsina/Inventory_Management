"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { upsertBusinessAction } from "@/actions/business";
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

type Props = {
  initial: { name: string; phone: string; address: string } | null;
};

export function SettingsForm({ initial }: Props) {
  const [state, action] = useFormState(upsertBusinessAction, null);

  useEffect(() => {
    if (state && typeof state === "object" && "ok" in state && state.ok) {
      toast.success("Saved");
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business</CardTitle>
        <CardDescription>
          {initial ? "Update your shop details." : "Create your shop to enable khata and stock."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="e.g. Shree Kirana Store"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={initial?.phone}
              placeholder="+91 …"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={initial?.address}
              rows={3}
            />
          </div>
          {state && typeof state === "object" && "error" in state && state.error ? (
            <p className="text-sm text-rose-600">
              {typeof state.error === "string"
                ? state.error
                : "Could not save. Check fields."}
            </p>
          ) : null}
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
