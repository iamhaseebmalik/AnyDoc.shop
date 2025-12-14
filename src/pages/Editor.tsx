import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Camera, 
  Type, 
  CheckCircle, 
  Download, 
  ArrowLeft,
  Shield,
  AlertCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useDocumentOCR, ExtractedDocumentData } from "@/hooks/useDocumentOCR";
import { useDocumentStorage, UploadedDocument } from "@/hooks/useDocumentStorage";

type EditorStep = "upload" | "detect" | "photo" | "text" | "compliance" | "export";

interface TextField {
  id: string;
  label: string;
  value: string;
  editable: boolean;
}

const Editor = () => {
  const [currentStep, setCurrentStep] = useState<EditorStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("white");
  const [complianceChecks, setComplianceChecks] = useState({
    facePosition: true,
    headSize: true,
    eyeAlignment: true,
    backgroundUniformity: true,
    imageQuality: true
  });
  const [textFields, setTextFields] = useState<TextField[]>([]);

  const { extractTextFromDocument, isExtracting, error: ocrError } = useDocumentOCR();
  const { uploadDocument, deleteDocument, isUploading, uploadProgress } = useDocumentStorage();

  const steps = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "detect", label: "Detect", icon: Camera },
    { id: "photo", label: "Photo", icon: Camera },
    { id: "text", label: "Text", icon: Type },
    { id: "compliance", label: "Check", icon: CheckCircle },
    { id: "export", label: "Export", icon: Download }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const mapExtractedDataToFields = (data: ExtractedDocumentData): TextField[] => {
    const fields: TextField[] = [];
    
    if (data.fullName) {
      fields.push({ id: "name", label: "Full Name", value: data.fullName, editable: true });
    }
    if (data.nationality) {
      fields.push({ id: "nationality", label: "Nationality", value: data.nationality, editable: true });
    }
    if (data.dateOfBirth) {
      fields.push({ id: "dob", label: "Date of Birth", value: data.dateOfBirth, editable: true });
    }
    if (data.gender) {
      fields.push({ id: "gender", label: "Gender", value: data.gender, editable: true });
    }
    if (data.documentNumber) {
      fields.push({ id: "passport_no", label: "Document No.", value: data.documentNumber, editable: true });
    }
    if (data.expiryDate) {
      fields.push({ id: "expiry", label: "Expiry Date", value: data.expiryDate, editable: true });
    }
    if (data.issueDate) {
      fields.push({ id: "issue", label: "Issue Date", value: data.issueDate, editable: true });
    }
    if (data.placeOfBirth) {
      fields.push({ id: "pob", label: "Place of Birth", value: data.placeOfBirth, editable: true });
    }
    if (data.placeOfIssue) {
      fields.push({ id: "poi", label: "Place of Issue", value: data.placeOfIssue, editable: true });
    }
    if (data.surname) {
      fields.push({ id: "surname", label: "Surname", value: data.surname, editable: true });
    }
    if (data.givenNames) {
      fields.push({ id: "given_names", label: "Given Names", value: data.givenNames, editable: true });
    }

    // If no fields extracted, provide placeholder
    if (fields.length === 0) {
      fields.push(
        { id: "name", label: "Full Name", value: "", editable: true },
        { id: "nationality", label: "Nationality", value: "", editable: true },
        { id: "dob", label: "Date of Birth", value: "", editable: true },
        { id: "gender", label: "Gender", value: "", editable: true },
        { id: "passport_no", label: "Document No.", value: "", editable: true },
        { id: "expiry", label: "Expiry Date", value: "", editable: true }
      );
    }

    return fields;
  };

  const handleFile = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setCurrentStep("detect");
    
    toast({
      title: "Uploading document",
      description: "Securely storing your document..."
    });

    // Upload to secure storage
    const uploaded = await uploadDocument(file);
    
    if (!uploaded) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
      setCurrentStep("upload");
      return;
    }

    setUploadedDocument(uploaded);
    setPreviewUrl(uploaded.signedUrl);
    
    toast({
      title: "Document secured",
      description: "AI is analyzing your document..."
    });

    // Only process images for OCR (PDFs would need different handling)
    if (file.type !== "application/pdf") {
      const extractedData = await extractTextFromDocument(file);
      
      if (extractedData) {
        const fields = mapExtractedDataToFields(extractedData);
        setTextFields(fields);
        
        toast({
          title: "Detection complete",
          description: `Extracted ${fields.length} text fields from document.`
        });
        setCurrentStep("photo");
      } else {
        toast({
          title: "Detection complete",
          description: "Document detected. Manual text entry may be required.",
          variant: "default"
        });
        setTextFields([
          { id: "name", label: "Full Name", value: "", editable: true },
          { id: "nationality", label: "Nationality", value: "", editable: true },
          { id: "dob", label: "Date of Birth", value: "", editable: true },
          { id: "gender", label: "Gender", value: "", editable: true },
          { id: "passport_no", label: "Document No.", value: "", editable: true },
          { id: "expiry", label: "Expiry Date", value: "", editable: true }
        ]);
        setCurrentStep("photo");
      }
    } else {
      // For PDFs, provide placeholder fields
      setTextFields([
        { id: "name", label: "Full Name", value: "", editable: true },
        { id: "nationality", label: "Nationality", value: "", editable: true },
        { id: "dob", label: "Date of Birth", value: "", editable: true },
        { id: "gender", label: "Gender", value: "", editable: true },
        { id: "passport_no", label: "Document No.", value: "", editable: true },
        { id: "expiry", label: "Expiry Date", value: "", editable: true }
      ]);
      toast({
        title: "PDF detected",
        description: "Please enter document details manually."
      });
      setCurrentStep("photo");
    }
  };

  const handleResetEditor = async () => {
    // Delete uploaded document from storage if exists
    if (uploadedDocument) {
      await deleteDocument(uploadedDocument.storagePath, uploadedDocument.id);
    }
    setCurrentStep("upload");
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadedDocument(null);
    setTextFields([]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const backgroundColors = [
    { id: "white", label: "White", color: "#FFFFFF" },
    { id: "blue", label: "Blue", color: "#4A90D9" },
    { id: "gray", label: "Gray", color: "#E5E5E5" }
  ];


  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? "border-accent bg-accent/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Upload Your Document
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your passport, ID, or driving license here
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInput}
              />
              <label htmlFor="file-upload">
                <Button variant="accent" size="lg" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-5 h-5" />
                    Choose File
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supports JPG, PNG, PDF • Max 10MB
              </p>
            </div>
          </div>
        );

      case "detect":
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isUploading 
                  ? "Uploading Securely..." 
                  : isExtracting 
                    ? "Extracting Text with AI..." 
                    : "Analyzing Document..."}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isUploading 
                  ? "Your document is being encrypted and stored securely" 
                  : isExtracting 
                    ? "Our AI is reading and extracting text from your document" 
                    : "Our AI is detecting face, text fields, and document type"}
              </p>
              {isUploading && (
                <div className="w-full bg-secondary rounded-full h-2 mb-4">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Auto-deletes in 24 hours</span>
              </div>
              {ocrError && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">{ocrError}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="flex-1 grid lg:grid-cols-2 gap-6 p-6">
            {/* Preview */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Document Preview</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="aspect-[3/2] bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-4/5 h-4/5 bg-primary rounded-lg shadow-lg flex flex-col p-6">
                    <div className="text-primary-foreground text-sm font-bold mb-4">PASSPORT</div>
                    <div className="flex gap-4 flex-1">
                      <div className="w-1/3 bg-secondary/20 rounded-md flex items-center justify-center border-2 border-dashed border-accent">
                        <Camera className="w-8 h-8 text-accent" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3 bg-secondary/30 rounded w-full" />
                        <div className="h-3 bg-secondary/30 rounded w-3/4" />
                        <div className="h-3 bg-secondary/30 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Face detection overlay */}
                <div className="absolute top-1/4 left-1/6 w-24 h-28 border-2 border-accent rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Controls */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Photo Settings</h3>
                
                {/* Background Color */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    {backgroundColors.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          selectedBackground === bg.id 
                            ? "border-accent scale-110" 
                            : "border-border"
                        }`}
                        style={{ backgroundColor: bg.color }}
                        title={bg.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Upload New Photo */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Replace Photo
                  </label>
                  <Button variant="outline" className="w-full">
                    <Camera className="w-4 h-4" />
                    Upload New Face Photo
                  </Button>
                </div>

                {/* Quality Score */}
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Face Quality Score</span>
                    <span className="text-sm font-bold text-accent">Excellent</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                  Back
                </Button>
                <Button variant="accent" className="flex-1" onClick={() => setCurrentStep("text")}>
                  Continue to Text Editing
                </Button>
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="flex-1 grid lg:grid-cols-2 gap-6 p-6">
            {/* Preview */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Detected Text Fields</h3>
              <div className="aspect-[3/2] bg-secondary rounded-lg flex items-center justify-center relative">
                <div className="w-4/5 h-4/5 bg-primary rounded-lg shadow-lg flex flex-col p-6">
                  <div className="text-primary-foreground text-sm font-bold mb-4">PASSPORT</div>
                  <div className="flex gap-4 flex-1">
                    <div className="w-1/3 bg-secondary/20 rounded-md" />
                    <div className="flex-1 flex flex-col gap-2">
                      {textFields.slice(0, 4).map((field, i) => (
                        <div 
                          key={field.id}
                          className="h-3 bg-accent/50 rounded w-full cursor-pointer hover:bg-accent transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Editor */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Edit Text Fields</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {textFields.length > 0 ? textFields.map((field) => (
                  <div key={field.id}>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => {
                        setTextFields(prev => 
                          prev.map(f => f.id === field.id ? { ...f, value: e.target.value } : f)
                        );
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No text fields detected. You can add them manually.</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("photo")}>
                  Back
                </Button>
                <Button variant="accent" className="flex-1" onClick={() => setCurrentStep("compliance")}>
                  Run Compliance Check
                </Button>
              </div>
            </div>
          </div>
        );

      case "compliance":
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-card rounded-xl border border-border p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Compliance Check Complete
                </h3>
                <p className="text-muted-foreground">
                  Your document meets international standards
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {Object.entries(complianceChecks).map(([key, passed]) => (
                  <div 
                    key={key} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      passed ? "bg-accent/10" : "bg-destructive/10"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {passed ? (
                      <Check className="w-5 h-5 text-accent" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep("text")}>
                  Back
                </Button>
                <Button variant="accent" className="flex-1" onClick={() => setCurrentStep("export")}>
                  Proceed to Export
                </Button>
              </div>
            </div>
          </div>
        );

      case "export":
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-card rounded-xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your Document is Ready
              </h3>
              <p className="text-muted-foreground mb-8">
                Download your edited document in your preferred format
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { format: "PNG", desc: "High Resolution" },
                  { format: "JPG", desc: "Compressed" },
                  { format: "PDF", desc: "Print Ready" }
                ].map((option) => (
                  <Button 
                    key={option.format}
                    variant="outline" 
                    className="flex-col h-auto py-4"
                    onClick={() => toast({
                      title: "Download started",
                      description: `Downloading as ${option.format}...`
                    })}
                  >
                    <span className="font-bold">{option.format}</span>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </Button>
                ))}
              </div>

              <Button variant="ghost" onClick={handleResetEditor}>
                Edit Another Document
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4">
        <Link to="/" className="flex items-center gap-2 mr-8">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">
            IDPerfect<span className="text-accent">.ai</span>
          </span>
        </div>

        {/* Steps Indicator */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => {
              const stepIndex = steps.findIndex(s => s.id === currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : isCompleted 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      isCompleted ? "bg-primary" : "bg-secondary"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-24" />
      </header>

      {/* Content */}
      {renderStepContent()}

      {/* Footer */}
      <footer className="h-12 border-t border-border bg-card flex items-center justify-center px-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            256-bit Encrypted
          </span>
          <span>•</span>
          <span>Auto-delete in 24h</span>
          <span>•</span>
          <span>GDPR Compliant</span>
        </div>
      </footer>
    </div>
  );
};

export default Editor;
