"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workoutFrequency, setWorkoutFrequency] = useState("");
  const [injuries, setInjuries] = useState("");

  const selectClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.register({
        name, email, password,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        fitness_goal: fitnessGoal || undefined,
        experience_level: experienceLevel || undefined,
        workout_frequency: workoutFrequency || undefined,
        injuries: injuries || undefined,
      });
      login(res.access_token, res.user_id, res.name);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">{step === 1 ? "Create account" : "Your profile"}</CardTitle>
          <CardDescription className="text-xs">{step === 1 ? "Get started with GymGenie" : "Personalize your experience"}</CardDescription>
          <div className="mx-auto mt-3 flex gap-1.5">
            <div className={`h-1 w-10 rounded-full ${step >= 1 ? "bg-foreground" : "bg-muted"}`} />
            <div className={`h-1 w-10 rounded-full ${step >= 2 ? "bg-foreground" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">{error}</div>}

          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input placeholder="Jay Patel" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" placeholder="jay@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Password</Label><Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={() => { if (!name || !email || !password) { setError("Fill in all fields"); return; } if (password.length < 6) { setError("Password must be 6+ characters"); return; } setError(""); setStep(2); }}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Age</Label><Input type="number" placeholder="21" value={age} onChange={(e) => setAge(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Gender</Label>
                  <select className={selectClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Height (cm)</Label><Input type="number" placeholder="175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Weight (kg)</Label><Input type="number" placeholder="74" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Fitness Goal</Label>
                <select className={selectClass} value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)}>
                  <option value="">Select</option><option value="lose_weight">Lose Weight</option><option value="build_muscle">Build Muscle</option><option value="gain_strength">Gain Strength</option><option value="improve_endurance">Improve Endurance</option><option value="stay_active">Stay Active</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Experience</Label>
                  <select className={selectClass} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                    <option value="">Select</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Frequency</Label>
                  <select className={selectClass} value={workoutFrequency} onChange={(e) => setWorkoutFrequency(e.target.value)}>
                    <option value="">Select</option><option value="1-2">1-2x/wk</option><option value="3-4">3-4x/wk</option><option value="5-6">5-6x/wk</option><option value="daily">Daily</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Injuries (optional)</Label><Input placeholder="e.g. shoulder, knee" value={injuries} onChange={(e) => setInjuries(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}Create
                </Button>
              </div>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Have an account? <Link href="/login" className="font-medium underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
