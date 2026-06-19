"use client";

import { SignUp } from "@clerk/nextjs";
import Dice3D from "@/components/Dice3D";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#111118] flex flex-col items-center justify-center p-4 text-slate-100 overflow-hidden relative">
      <div className="hidden sm:block absolute top-1/4 left-[10%] lg:left-1/4 opacity-10">
        <Dice3D value={6} />
      </div>
      <div className="hidden sm:block absolute bottom-1/4 right-[10%] lg:right-1/4 opacity-10">
        <Dice3D value={6} />
      </div>

      <div className="relative z-10 text-center mb-6 sm:mb-8 mt-8 sm:mt-0">
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2 tracking-tight">
          Monopoly
        </h1>
        <p className="text-slate-400 font-medium text-sm sm:text-base">Create your account</p>
      </div>

      <div className="relative z-10 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
        <SignUp 
          path="/register"
          routing="path"
          signInUrl="/login"
          fallbackRedirectUrl="/rooms"
          appearance={{ 
            elements: { 
              rootBox: "mx-auto",
              card: "bg-[#161622]/80 backdrop-blur-xl border-none shadow-none",
              headerTitle: "text-slate-100",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "border-white/10 text-slate-200 hover:bg-white/5",
              socialButtonsBlockButtonText: "text-slate-200 font-bold",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-500",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-black/20 border-white/10 text-slate-100 focus:border-indigo-500",
              formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]",
              footerActionText: "text-slate-400",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold"
            } 
          }} 
        />
      </div>
    </div>
  );
}
