import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Brain, Dumbbell, ArrowRight, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: MessageSquare, title: "Ask Anything", desc: "Workouts, nutrition, form — get instant, personalized answers" },
    { icon: Brain, title: "ML-Powered", desc: "Exercise classifier trained on 2900+ movements for precise recommendations" },
    { icon: Dumbbell, title: "Profile-Aware", desc: "Responses tailored to your goals, level, and injury history" },
    { icon: Shield, title: "Safe Advice", desc: "Built with safety guardrails — we'll tell you when to see a doctor" },
    { icon: Zap, title: "Instant", desc: "Fast, conversational — no waiting for a trainer to text back" },
    { icon: ArrowRight, title: "Free", desc: "No subscription. Just sign up and start asking." },
  ];

  const steps = [
    { step: "01", title: "Sign Up", desc: "Create an account and fill in your fitness profile" },
    { step: "02", title: "Chat", desc: "Ask GymGenie about workouts, exercises, or nutrition" },
    { step: "03", title: "Improve", desc: "Follow the personalized plans and track your progress" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-24 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Dumbbell className="h-3 w-3" /> AI-powered fitness coaching
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Your fitness questions,<br />answered instantly.
        </h1>
        <p className="mb-8 max-w-md text-sm text-muted-foreground leading-relaxed">
          GymGenie is an AI fitness assistant trained on thousands of exercises. Ask it anything about workouts, form, nutrition, or training — it knows your profile.
        </p>
        <div className="flex gap-3">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Log In</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-accent/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-lg font-semibold">What makes GymGenie different</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border bg-background p-5">
                <f.icon className="mb-3 h-4 w-4 text-muted-foreground" />
                <h3 className="mb-1 text-sm font-medium">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-lg font-semibold">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold">{s.step}</div>
                <h3 className="mb-1 text-sm font-medium">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Dumbbell className="h-3 w-3" /> GymGenie AI
          </div>
          <p className="text-[10px] text-muted-foreground">Built for learning purposes. Not a substitute for professional training.</p>
        </div>
      </footer>
    </div>
  );
}
