"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { changePassword, updateProfile } from "@/lib/auth";
import { Download, KeyRound, Loader2, Scissors, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountOverviewPage() {
  const { user, token, loading: authLoading, refreshUser, logout } = useAuth();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your account</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account">Sign in</Link>
        </Button>
      </div>
    );
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setNameMessage(null);
    setSavingName(true);
    try {
      await updateProfile(token, { name: name.trim() });
      await refreshUser();
      setNameMessage({ type: "success", text: "Name updated." });
    } catch (err) {
      setNameMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't update name" });
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordMessage(null);
    setChangingPassword(true);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage({ type: "success", text: "Password changed." });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn't change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/account/purchases">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">My Purchases</p>
                <p className="text-sm text-muted-foreground">Downloads &amp; order history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/garment-tool">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-3">
              <Scissors className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Garment Tool</p>
                <p className="text-sm text-muted-foreground">Process a design .psd</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" /> Profile details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="name">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="email">
                Email
              </label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email.</p>
            </div>
            {nameMessage && (
              <p className={`text-sm ${nameMessage.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
                {nameMessage.text}
              </p>
            )}
            <Button type="submit" disabled={savingName}>
              {savingName ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" /> Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="currentPassword">
                Current password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="newPassword">
                New password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
                {passwordMessage.text}
              </p>
            )}
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
