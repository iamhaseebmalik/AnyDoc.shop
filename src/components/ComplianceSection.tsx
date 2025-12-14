import { Shield, Lock, Trash2, FileCheck, Globe, Eye } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit Encryption",
    description: "All uploads are protected with bank-grade AES-256 encryption during transit and at rest."
  },
  {
    icon: Trash2,
    title: "Auto-Delete Policy",
    description: "Your documents are automatically and permanently deleted from our servers within 24 hours."
  },
  {
    icon: Eye,
    title: "No Public URLs",
    description: "Documents are never stored on public URLs. Private, signed access only for authorized users."
  },
  {
    icon: FileCheck,
    title: "GDPR Compliant",
    description: "Full compliance with European data protection regulations. Your privacy is our priority."
  },
  {
    icon: Globe,
    title: "SOC 2 Certified",
    description: "Our infrastructure meets SOC 2 Type II standards for security, availability, and confidentiality."
  },
  {
    icon: Shield,
    title: "ISO 27001",
    description: "Information security management certified to international ISO 27001 standards."
  }
];

const ComplianceSection = () => {
  return (
    <section id="compliance" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <Shield 
              key={i} 
              className="absolute w-24 h-24"
              style={{
                left: `${(i % 5) * 25}%`,
                top: `${Math.floor(i / 5) * 25}%`,
                transform: `rotate(${i * 18}deg)`
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium mb-4">
            <Shield className="w-4 h-4 text-accent" />
            Enterprise-Grade Security
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Documents Are Safe With Us
          </h2>
          <p className="text-lg text-primary-foreground/80">
            We take security seriously. Your sensitive documents are protected with 
            the highest industry standards and compliance certifications.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10 hover:border-accent/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10">
            <h4 className="font-semibold mb-2">Important Legal Notice</h4>
            <p className="text-sm text-primary-foreground/70">
              IDPerfect.ai is not affiliated with any government agency. Document editing 
              does not guarantee acceptance by authorities. Users are solely responsible 
              for ensuring the legality of document modifications in their jurisdiction. 
              By using our service, you confirm you have legal permission to edit the documents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
