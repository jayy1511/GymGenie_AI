"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User, Ruler, Weight, Target, Dumbbell, Calendar, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workoutFrequency, setWorkoutFrequency] = useState("");
  const [injuries, setInjuries] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || ""); setAge(user.age?.toString() || ""); setGender(user.gender || "");
      setHeightCm(user.height_cm?.toString() || ""); setWeightKg(user.weight_kg?.toString() || "");
      setFitnessGoal(user.fitness_goal || ""); setExperienceLevel(user.experience_level || "");
      setWorkoutFrequency(user.workout_frequency || ""); setInjuries(user.injuries || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess(false);
    try {
      await api.updateProfile({
        name: name || undefined, age: age ? parseInt(age) : undefined,
        gender: gender || undefined, height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined, fitness_goal: fitnessGoal || undefined,
        experience_level: experienceLevel || undefined, workout_frequency: workoutFrequency || undefined,
        injuries: injuries || undefined,
      });
      await refreshUser();
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally { setSaving(false); }
  };

  if (authLoading || !user) return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and fitness details. This helps GymGenie personalize your experience.</p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
          <Save className="h-4 w-4" /> Profile saved successfully
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Account Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator className="mb-5" />
          <div>
            <Label className="text-sm font-medium">Display Name</Label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
        </CardContent>
      </Card>

      {/* Body Measurements */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            Body Measurements
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Age</Label>
              <Input className="mt-1.5" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 21" />
            </div>
            <div>
              <Label className="text-sm font-medium">Gender</Label>
              <select className={`${selectClass} mt-1.5`} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Ruler className="h-3 w-3" /> Height
              </Label>
              <div className="relative mt-1.5">
                <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="e.g. 175" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Weight className="h-3 w-3" /> Weight
              </Label>
              <div className="relative mt-1.5">
                <Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 74" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Preferences */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold">
            <Target className="h-4 w-4 text-muted-foreground" />
            Fitness Preferences
          </h3>

          <div className="grid gap-5">
            <div>
              <Label className="text-sm font-medium">What&apos;s your goal?</Label>
              <select className={`${selectClass} mt-1.5`} value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)}>
                <option value="">Select a goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="gain_strength">Gain Strength</option>
                <option value="improve_endurance">Improve Endurance</option>
                <option value="stay_active">Stay Active & Healthy</option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Dumbbell className="h-3 w-3" /> Experience Level
                </Label>
                <select className={`${selectClass} mt-1.5`} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                  <option value="">Select level</option>
                  <option value="beginner">Beginner (0–1 year)</option>
                  <option value="intermediate">Intermediate (1–3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Workout Frequency
                </Label>
                <select className={`${selectClass} mt-1.5`} value={workoutFrequency} onChange={(e) => setWorkoutFrequency(e.target.value)}>
                  <option value="">How often?</option>
                  <option value="1-2">1–2 times / week</option>
                  <option value="3-4">3–4 times / week</option>
                  <option value="5-6">5–6 times / week</option>
                  <option value="daily">Every day</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Injuries or Limitations
              </Label>
              <Input className="mt-1.5" value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="e.g. lower back pain, torn ACL" />
              <p className="mt-1 text-xs text-muted-foreground">GymGenie will avoid recommending exercises that could aggravate these.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button className="w-full h-11 text-sm font-medium" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}
