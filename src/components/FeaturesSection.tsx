import { 
  Camera, 
  FileText, 
  CheckSquare, 
  Palette, 
  Shield, 
  Zap,
  Scan,
  Type
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Photo Enhancement",
    description: "Automatically adjust background color, face centering, head size alignment, and remove unwanted shadows or noise.",
    highlight: "99.8% compliance rate"
  },
  {
    icon: Scan,
    title: "Smart OCR Extraction",
    description: "Advanced AI extracts all text fields including name, date of birth, passport number, and MRZ zone with high accuracy.",
    highlight: "50+ languages supported"
  },
  {
    icon: Type,
    title: "Text Field Editing",
    description: "Edit any detected text field with font matching technology that preserves the original document appearance.",
    highlight: "Auto font matching"
  },
  {
    icon: Palette,
    title: "Background Customization",
    description: "Choose from white, blue, or country-specific background colors. AI ensures uniform background without shadows.",
    highlight: "All countries supported"
  },
  {
    icon: CheckSquare,
    title: "Compliance Verification",
    description: "Real-time compliance check against ICAO 9303 standards for face position, head size, eye alignment, and image quality.",
    highlight: "ICAO 9303 standard"
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "256-bit encryption, no public URLs, and automatic file deletion after 24 hours. GDPR compliant processing.",
    highlight: "Auto-delete in 24h"
  },
  {
    icon: FileText,
    title: "MRZ Validation",
    description: "Machine Readable Zone editing with automatic format validation and regeneration according to international standards.",
    highlight: "Auto MRZ generation"
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Get your edited document in seconds. No waiting, no queues. Download in high-resolution PNG, JPG, or print-ready PDF.",
    highlight: "< 10 second processing"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powered by Advanced AI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Perfect ID Documents
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional-grade tools powered by AI to ensure your passport and ID photos 
            meet all international requirements.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-xl p-6 border border-border hover:border-accent/50 hover:shadow-large transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
