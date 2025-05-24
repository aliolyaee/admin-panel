
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'ورود - پنل مدیریت یووتاب', // Login - Reservista Admin
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-background p-4"> {/* from-primary/10 to-br changed to to-bl for RTL aesthetics */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="https://placehold.co/1920x1080.png?text=Restaurant+Pattern"
          alt="الگوی انتزاعی رستوران" // Abstract restaurant pattern
          data-ai-hint="restaurant pattern"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      <LoginForm />
    </div>
  );
}
