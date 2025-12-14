import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-primary-foreground">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm mb-6 animate-slide-up">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Trusted by 50,000+ users worldwide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up animation-delay-100">
              Perfect Your Passport Photos with{" "}
              <span className="text-accent">AI Precision</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl animate-slide-up animation-delay-200">
              Upload any passport or ID document. Our AI automatically adjusts photos, 
              edits text fields, and ensures compliance with international standards.
            </p>

            {/* Trust Points */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up animation-delay-300">
              {[
                "Government-compliant",
                "256-bit encryption",
                "Auto-delete in 24h"
              ].map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{point}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400">
              <Link to="/editor">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <Sparkles className="w-5 h-5" />
                  Start Free Edit
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-primary-foreground/20 animate-slide-up animation-delay-500">
              {[
                { value: "2M+", label: "Documents Processed" },
                { value: "99.8%", label: "Compliance Rate" },
                { value: "150+", label: "Countries Supported" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Document Preview */}
          <div className="relative lg:pl-8 animate-slide-up animation-delay-300">
            <div className="relative">
              {/* Main Document Card */}
              <div className="bg-card rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[3/2] bg-gradient-to-br from-secondary to-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                  {/* Passport Mock */}
                  <div className="w-4/5 h-4/5 bg-primary rounded-lg shadow-large flex flex-col p-4">
                    <div className="text-primary-foreground text-xs font-bold mb-2">PASSPORT</div>
                    <div className="flex gap-3 flex-1">
                      {/* Photo Area */}
                      <div className="w-1/3 bg-secondary/20 rounded-md flex items-center justify-center">
                        <div className="w-12 h-14 bg-secondary/40 rounded-sm" />
                      </div>
                      {/* Text Area */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-2 bg-secondary/30 rounded w-full" />
                        <div className="h-2 bg-secondary/30 rounded w-3/4" />
                        <div className="h-2 bg-secondary/30 rounded w-1/2" />
                        <div className="mt-auto">
                          <div className="h-1.5 bg-secondary/20 rounded w-full mb-1" />
                          <div className="h-1.5 bg-secondary/20 rounded w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Indicators */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-accent rounded-full text-xs font-bold text-accent-foreground animate-pulse-glow">
                    AI Processing
                  </div>
                </div>

                {/* Action Indicators */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-sm font-medium text-foreground">Face detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-sm font-medium text-foreground">Text extracted</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-large p-3 animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Compliant</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-large p-3 animate-float animation-delay-300">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
