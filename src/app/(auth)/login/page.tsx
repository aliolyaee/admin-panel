import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Login - Reservista Admin',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <LoginForm />
    </div>
  );
}
