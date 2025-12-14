import { 
  Upload, 
  Scan, 
  Camera, 
  Type, 
  CheckCircle, 
  Download,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Document",
    description: "Upload your passport, national ID, or driving license. Supports JPG, PNG, and PDF formats up to 10MB.",
    color: "bg-primary"
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Detection",
    description: "Our AI automatically detects face photo area, text fields, MRZ zone, and document type with high precision.",
    color: "bg-info"
  },
  {
    number: "03",
    icon: Camera,
    title: "Photo Editing",
    description: "Replace or enhance the passport photo. AI adjusts background, centering, lighting, and ensures proper head size.",
    color: "bg-accent"
  },
  {
    number: "04",
    icon: Type,
    title: "Text Editing",
    description: "Edit extracted text fields with auto-matched fonts. AI maintains original positioning and character validation.",
    color: "bg-warning"
  },
  {
    number: "05",
    icon: CheckCircle,
    title: "Compliance Check",
    description: "Real-time verification against international standards. Get instant feedback on face position, alignment, and quality.",
    color: "bg-success"
  },
  {
    number: "06",
    icon: Download,
    title: "Export & Download",
    description: "Download your edited document in high-resolution image or print-ready PDF format. Ready for official use.",
    color: "bg-primary"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple 6-Step Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From upload to download in under a minute. Our streamlined process 
            ensures professional results every time.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && index !== 2 && (
                <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-border z-0 -translate-x-4">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              )}

              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-large transition-all duration-300 relative z-10 h-full">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to get started? Upload your first document for free.
          </p>
          <a href="/editor" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline">
            Try it now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
