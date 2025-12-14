import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Pay Per Edit",
    price: "$3",
    period: "per document",
    description: "Perfect for one-time use. No commitment required.",
    features: [
      "Single document edit",
      "AI photo enhancement",
      "Text field editing",
      "Compliance check",
      "High-res download",
      "24-hour file retention"
    ],
    cta: "Edit Now",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Credit Pack",
    price: "$20",
    period: "10 credits",
    description: "Best value for occasional users. Credits never expire.",
    features: [
      "10 document edits",
      "All AI features included",
      "Priority processing",
      "MRZ zone editing",
      "Print-ready PDFs",
      "Email support"
    ],
    cta: "Buy Credits",
    variant: "accent" as const,
    popular: true,
    savings: "Save 33%"
  },
  {
    name: "Professional",
    price: "$49",
    period: "per month",
    description: "Unlimited edits for travel agents and HR teams.",
    features: [
      "Unlimited document edits",
      "Bulk upload support",
      "API access",
      "White-label exports",
      "Priority support",
      "Team accounts (5 users)"
    ],
    cta: "Start Free Trial",
    variant: "default" as const,
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Simple Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Flexible options for individuals and teams. Start with a free edit 
            to experience the quality.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? "border-accent shadow-large scale-105" 
                  : "border-border hover:border-primary/30"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="mt-2 inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded">
                    {plan.savings}
                  </div>
                )}
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button variant={plan.variant} className="w-full" size="lg">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Money-back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            30-day money-back guarantee on all plans
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
