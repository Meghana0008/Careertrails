import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Building2, TrendingUp, Sparkles, Globe, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Careertrails</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-slate-900 text-white hover:bg-slate-800" size="sm" className="gap-1.5">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-50/80 via-white to-white" />
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 mb-8">
              <Zap className="h-4 w-4" /> Now with live Indian job portal integration
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Launch Your Career with{" "}
              <span className="text-slate-900">Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate placement portal connecting students with top companies. Track jobs, applications, and offers — all in one beautiful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="bg-slate-900 text-white hover:bg-slate-800" size="lg" className="gap-2 text-base px-8">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need for <span className="text-slate-900">placements</span></h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Built for students and placement teams to streamline the entire hiring process.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "For Students",
                desc: "Apply to jobs, track offers, and manage your placement journey in one place.",
                gradient: "from-indigo-500 to-blue-600",
                shadow: "shadow-indigo-200",
                bg: "bg-indigo-50",
              },
              {
                icon: Building2,
                title: "For Companies",
                desc: "Connect with top talent, schedule drives, and streamline your hiring process.",
                gradient: "from-violet-500 to-purple-600",
                shadow: "shadow-violet-200",
                bg: "bg-violet-50",
              },
              {
                icon: Globe,
                title: "Off-Campus Jobs",
                desc: "Live job listings from LinkedIn, Indeed, and Naukri — powered by Indian job portals.",
                gradient: "from-emerald-500 to-teal-600",
                shadow: "shadow-emerald-200",
                bg: "bg-emerald-50",
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="p-6 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 card-hover group">
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg ${feature.shadow}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 bg-linear-to-r from-indigo-50/50 to-purple-50/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Students" },
              { value: "50+", label: "Companies" },
              { value: "95%", label: "Placement Rate" },
              { value: "18 LPA", label: "Highest Package" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-border/50 bg-white text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-slate-900">Careertrails</span>
        </div>
        <p className="text-sm text-muted-foreground">&copy; 2025 Careertrails. Built for campus placements.</p>
      </footer>
    </div>
  );
}
