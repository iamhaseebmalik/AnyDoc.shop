import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  CreditCard, 
  Car,
  ChevronRight
} from "lucide-react";
import { idTemplates, IDTemplate } from "@/data/idTemplates";

interface TemplateSelectorProps {
  onSelectTemplate: (template: IDTemplate) => void;
  onClose: () => void;
}

export const TemplateSelector = ({ onSelectTemplate, onClose }: TemplateSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "passport" | "national_id" | "driving_license">("all");

  const filteredTemplates = idTemplates.filter(template => {
    const matchesSearch = 
      template.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.documentTypeLabel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || template.documentType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.documentType]) {
      acc[template.documentType] = [];
    }
    acc[template.documentType].push(template);
    return acc;
  }, {} as Record<string, IDTemplate[]>);

  const documentTypeIcons = {
    passport: FileText,
    national_id: CreditCard,
    driving_license: Car
  };

  const documentTypeLabels = {
    passport: "Passports",
    national_id: "National IDs",
    driving_license: "Driving Licenses"
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Choose a Template
        </h3>
        <p className="text-muted-foreground text-sm">
          Select a country and document type to start with a pre-filled template
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by country or document type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter Tabs */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)} className="mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="passport" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Passports
          </TabsTrigger>
          <TabsTrigger value="national_id" className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            IDs
          </TabsTrigger>
          <TabsTrigger value="driving_license" className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            Licenses
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <ScrollArea className="h-[400px] rounded-lg border border-border">
        <div className="p-4 space-y-6">
          {Object.entries(groupedTemplates).map(([type, templates]) => {
            const Icon = documentTypeIcons[type as keyof typeof documentTypeIcons];
            const label = documentTypeLabels[type as keyof typeof documentTypeLabels];
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    {templates.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left"
                    >
                      {/* Color accent bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                        style={{ 
                          background: `linear-gradient(90deg, ${template.colors.primary}, ${template.colors.secondary})` 
                        }}
                      />
                      
                      <div className="flex items-start justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{template.flag}</span>
                          <div>
                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                              {template.country}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {template.documentTypeLabel}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      
                      {/* Field preview */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map((field) => (
                          <span 
                            key={field.id}
                            className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground"
                          >
                            {field.label.split('/')[0].trim()}
                          </span>
                        ))}
                        {template.fields.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                            +{template.fields.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No templates found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex justify-center">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
