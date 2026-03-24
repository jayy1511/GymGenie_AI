"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ChatSession } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, Label, PieChart, Pie, Cell } from "recharts";
import {
  MessageSquare,
  Target,
  Dumbbell,
  Activity,
  ArrowRight,
  Plus,
  TrendingUp,
  Calendar,
  User,
  Flame,
} from "lucide-react";

// Workout split distribution chart data
const workoutSplitData = [
  { name: "Push", sessions: 4, fill: "hsl(0, 0%, 85%)" },
  { name: "Pull", sessions: 3, fill: "hsl(0, 0%, 70%)" },
  { name: "Legs", sessions: 3, fill: "hsl(0, 0%, 55%)" },
  { name: "Core", sessions: 2, fill: "hsl(0, 0%, 40%)" },
  { name: "Cardio", sessions: 2, fill: "hsl(0, 0%, 28%)" },
];
const splitConfig: ChartConfig = {
  sessions: { label: "Sessions" },
  Push: { label: "Push", color: "hsl(0, 0%, 85%)" },
  Pull: { label: "Pull", color: "hsl(0, 0%, 70%)" },
  Legs: { label: "Legs", color: "hsl(0, 0%, 55%)" },
  Core: { label: "Core", color: "hsl(0, 0%, 40%)" },
  Cardio: { label: "Cardio", color: "hsl(0, 0%, 28%)" },
};

// Weekly activity data
const weeklyData = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 60 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 50 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 30 },
  { day: "Sun", minutes: 0 },
];
const weeklyConfig: ChartConfig = {
  minutes: { label: "Minutes", color: "hsl(0, 0%, 45%)" },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.getChatHistory(5)
        .then(setRecentChats)
        .catch(() => {})
        .finally(() => setChatsLoading(false));
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      </div>
    );
  }

  const goal = user.fitness_goal?.replace(/_/g, " ") || "Not set";
  const level = user.experience_level || "Not set";
  const freq = user.workout_frequency || "Not set";
  const profileFields = [user.age, user.height_cm, user.weight_kg, user.fitness_goal, user.experience_level].filter(Boolean).length;
  const profilePercent = Math.round((profileFields / 5) * 100);

  const profileRadialData = [{ name: "profile", value: profilePercent, fill: "hsl(0, 0%, 80%)" }];
  const profileChartConfig: ChartConfig = { value: { label: "Complete" } };

  const stats = [
    { label: "Fitness Goal", value: goal, icon: Target, sub: "Current target" },
    { label: "Experience", value: level, icon: TrendingUp, sub: "Skill level" },
    { label: "Frequency", value: `${freq}x / week`, icon: Calendar, sub: "Weekly sessions" },
    { label: "Conversations", value: recentChats.length.toString(), icon: MessageSquare, sub: "With GymGenie" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">Here&apos;s your fitness dashboard overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Weekly Activity Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <CardDescription>Estimated workout minutes per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyConfig} className="h-[250px] w-full">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip />
                <Bar dataKey="minutes" fill="hsl(0, 0%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Profile Completeness Radial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Completeness score</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={profileChartConfig} className="mx-auto aspect-square h-[200px] w-[200px]">
              <RadialBarChart data={profileRadialData} startAngle={90} endAngle={90 - (profilePercent / 100) * 360} innerRadius={70} outerRadius={100}>
                <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[74, 66]} />
                <RadialBar dataKey="value" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{profilePercent}%</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">complete</tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workout Split + Body Stats */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {/* Workout Split Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Split</CardTitle>
            <CardDescription>Recommended session distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={splitConfig} className="mx-auto aspect-square h-[220px] w-[220px]">
              <PieChart>
                <ChartTooltip />
                <Pie data={workoutSplitData} dataKey="sessions" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} strokeWidth={2} stroke="hsl(var(--background))">
                  {workoutSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Body Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Body Stats</CardTitle>
            <CardDescription>Your profile measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Age", value: user.age ? `${user.age} years` : "—", icon: User },
                { label: "Height", value: user.height_cm ? `${user.height_cm} cm` : "—", icon: Activity },
                { label: "Weight", value: user.weight_kg ? `${user.weight_kg} kg` : "—", icon: Flame },
                { label: "Gender", value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—", icon: User },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/chat" className="block">
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ask GymGenie</p>
                    <p className="text-xs text-muted-foreground">Get personalized advice</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/profile" className="block">
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Edit Profile</p>
                    <p className="text-xs text-muted-foreground">Update your fitness details</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            <CardDescription>Your chat history with GymGenie</CardDescription>
          </div>
          <Link href="/chat">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {chatsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : recentChats.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">No conversations yet</p>
              <p className="mb-6 text-sm text-muted-foreground">Start chatting to get personalized fitness advice</p>
              <Link href="/chat"><Button>Start a Chat</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <Link key={chat.id} href={`/chat?session=${chat.id}`} className="flex items-center justify-between rounded-lg border px-4 py-4 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(chat.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
