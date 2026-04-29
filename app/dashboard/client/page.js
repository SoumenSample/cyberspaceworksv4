import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await requireRole("client");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Client Workspace</CardTitle>
          <CardDescription>Track your requests and project communication in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.email}. Your personalized client modules can be added here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>View only the bills and invoices issued to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/client/billing" className="text-sm font-medium underline-offset-4 hover:underline">
            Open Billing
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Track milestone completion and timeline progress in read-only mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/projects" className="text-sm font-medium underline-offset-4 hover:underline">
            Open Project Timeline
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Create and track tickets related to your active projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/tickets" className="text-sm font-medium underline-offset-4 hover:underline">
            Open Tickets
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
