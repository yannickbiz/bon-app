import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-24 lg:py-32">
        <div className="container max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to Bon App
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                A modern authentication system built with Next.js, Supabase, and
                shadcn/ui. Secure, fast, and easy to use.
              </p>
            </div>

            {user ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">
                  Welcome back, {user.email}!
                </p>
                <Button size="lg" asChild>
                  <Link href="/profile">Go to Profile</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6 mt-16 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Built with Supabase for enterprise-grade security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support for email/password, magic links, and OAuth providers
                  out of the box.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modern UI</CardTitle>
                <CardDescription>
                  Beautiful components with shadcn/ui and Tailwind CSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fully responsive design with dark mode support and accessible
                  components.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type Safe</CardTitle>
                <CardDescription>
                  Built with TypeScript and validated with Biome
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Catch errors early with strict type checking and comprehensive
                  testing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
