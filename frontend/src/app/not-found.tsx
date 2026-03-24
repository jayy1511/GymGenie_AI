import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <Dumbbell className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">
        This page doesn&apos;t exist — kind of like skipping leg day, it just shouldn&apos;t happen.
      </p>
      <Link href="/">
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
