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
  Clock,
  Sparkles,
  RefreshCw, 
  Eye, 
  ArrowRight,
  LayoutTemplate,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useDocumentOCR, ExtractedDocumentData } from "@/hooks/useDocumentOCR";
import { useDocumentStorage, UploadedDocument } from "@/hooks/useDocumentStorage";
import { useDocumentEditor } from "@/hooks/useDocumentEditor";
import { useEditingHistory } from "@/hooks/useEditingHistory";
import { ZoomableImage } from "@/components/ZoomableImage";
import { TemplateSelector } from "@/components/TemplateSelector";
import { UserMenu } from "@/components/UserMenu";
import { IDTemplate } from "@/data/idTemplates";

type EditorStep = "upload" | "detect" | "photo" | "text" | "compliance" | "export";

interface TextField {
  id: string;
  label: string;
  value: string;
  originalValue: string;
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
  const [editedDocumentUrl, setEditedDocumentUrl] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IDTemplate | null>(null);
  const [templatePhotoUrl, setTemplatePhotoUrl] = useState<string | null>(null);
  const [templatePhotoFile, setTemplatePhotoFile] = useState<File | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const { extractTextFromDocument, isExtracting, error: ocrError } = useDocumentOCR();
  const { uploadDocument, deleteDocument, isUploading, uploadProgress } = useDocumentStorage();
  const { applyEdits, retryEdits, isEditing, error: editError, lastEditResult, currentAttempt } = useDocumentEditor();
  const { saveToHistory, isAuthenticated } = useEditingHistory();
  const [showComparison, setShowComparison] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

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
    const addedValues = new Set<string>(); // Prevent duplicates
    
    // Helper function to add field if value exists and not duplicate
    const addField = (id: string, label: string, value: string | undefined) => {
      if (value && !addedValues.has(value.toLowerCase().trim())) {
        addedValues.add(value.toLowerCase().trim());
        fields.push({ id, label, value, originalValue: value, editable: true });
      }
    };

    // PRIORITY 1: Use allDetectedText array if available (most comprehensive)
    if (data.allDetectedText && Array.isArray(data.allDetectedText) && data.allDetectedText.length > 0) {
      console.log("Using allDetectedText array with", data.allDetectedText.length, "items");
      data.allDetectedText.forEach((item, index) => {
        if (item.value && !addedValues.has(item.value.toLowerCase().trim())) {
          addedValues.add(item.value.toLowerCase().trim());
          fields.push({
            id: `detected_${index}`,
            label: item.label || `Field ${index + 1}`,
            value: item.value,
            originalValue: item.value,
            editable: true
          });
        }
      });
    }

    // PRIORITY 2: Add structured fields if not already in allDetectedText
    addField("documentType", "Document Type", data.documentType);
    addField("surname", "Surname / Family Name", data.surname);
    addField("givenNames", "Given Names / First Names", data.givenNames);
    addField("fullName", "Full Name", data.fullName);
    addField("dateOfBirth", "Date of Birth", data.dateOfBirth);
    addField("placeOfBirth", "Place of Birth", data.placeOfBirth);
    addField("gender", "Gender / Sex", data.gender);
    addField("nationality", "Nationality", data.nationality);
    addField("nationalityCode", "Nationality Code", data.nationalityCode);
    addField("documentNumber", "Document Number", data.documentNumber);
    addField("issueDate", "Issue Date", data.issueDate);
    addField("expiryDate", "Expiry Date", data.expiryDate);
    addField("placeOfIssue", "Place of Issue", data.placeOfIssue);
    addField("issuingAuthority", "Issuing Authority", data.issuingAuthority);
    addField("issuingCountry", "Issuing Country", data.issuingCountry);
    addField("address", "Address", data.address);
    addField("height", "Height", data.height);
    addField("eyeColor", "Eye Color", data.eyeColor);
    addField("bloodType", "Blood Type", data.bloodType);
    addField("occupation", "Occupation", data.occupation);
    addField("maritalStatus", "Marital Status", data.maritalStatus);
    addField("fatherName", "Father's Name", data.fatherName);
    addField("motherName", "Mother's Name", data.motherName);
    addField("spouseName", "Spouse Name", data.spouseName);
    addField("emergencyContact", "Emergency Contact", data.emergencyContact);
    addField("licenseClass", "License Class", data.licenseClass);
    addField("restrictions", "Restrictions", data.restrictions);
    
    // Add MRZ lines if present
    if (data.mrz && Array.isArray(data.mrz)) {
      data.mrz.forEach((line, index) => {
        if (line && !addedValues.has(line.toLowerCase().trim())) {
          addedValues.add(line.toLowerCase().trim());
          fields.push({
            id: `mrz_${index}`,
            label: `MRZ Line ${index + 1}`,
            value: line,
            originalValue: line,
            editable: true
          });
        }
      });
    }
    
    // Additional fields detected by AI
    if (data.additionalFields && Array.isArray(data.additionalFields)) {
      data.additionalFields.forEach((field, index) => {
        if (field.value && !addedValues.has(field.value.toLowerCase().trim())) {
          addedValues.add(field.value.toLowerCase().trim());
          fields.push({
            id: `additional_${index}`,
            label: field.label || `Additional Field ${index + 1}`,
            value: field.value,
            originalValue: field.value,
            editable: true
          });
        }
      });
    }

    console.log("Total fields mapped:", fields.length);

    // If no fields extracted, provide common placeholder fields
    if (fields.length === 0) {
      fields.push(
        { id: "surname", label: "Surname / Family Name", value: "", originalValue: "", editable: true },
        { id: "givenNames", label: "Given Names", value: "", originalValue: "", editable: true },
        { id: "dateOfBirth", label: "Date of Birth", value: "", originalValue: "", editable: true },
        { id: "gender", label: "Gender", value: "", originalValue: "", editable: true },
        { id: "nationality", label: "Nationality", value: "", originalValue: "", editable: true },
        { id: "documentNumber", label: "Document Number", value: "", originalValue: "", editable: true },
        { id: "issueDate", label: "Issue Date", value: "", originalValue: "", editable: true },
        { id: "expiryDate", label: "Expiry Date", value: "", originalValue: "", editable: true },
        { id: "placeOfBirth", label: "Place of Birth", value: "", originalValue: "", editable: true },
        { id: "placeOfIssue", label: "Place of Issue", value: "", originalValue: "", editable: true }
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
          { id: "name", label: "Full Name", value: "", originalValue: "", editable: true },
          { id: "nationality", label: "Nationality", value: "", originalValue: "", editable: true },
          { id: "dob", label: "Date of Birth", value: "", originalValue: "", editable: true },
          { id: "gender", label: "Gender", value: "", originalValue: "", editable: true },
          { id: "passport_no", label: "Document No.", value: "", originalValue: "", editable: true },
          { id: "expiry", label: "Expiry Date", value: "", originalValue: "", editable: true }
        ]);
        setCurrentStep("photo");
      }
    } else {
      // For PDFs, provide placeholder fields
      setTextFields([
        { id: "name", label: "Full Name", value: "", originalValue: "", editable: true },
        { id: "nationality", label: "Nationality", value: "", originalValue: "", editable: true },
        { id: "dob", label: "Date of Birth", value: "", originalValue: "", editable: true },
        { id: "gender", label: "Gender", value: "", originalValue: "", editable: true },
        { id: "passport_no", label: "Document No.", value: "", originalValue: "", editable: true },
        { id: "expiry", label: "Expiry Date", value: "", originalValue: "", editable: true }
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
    // Clean up template photo URL
    if (templatePhotoUrl) {
      URL.revokeObjectURL(templatePhotoUrl);
    }
    setCurrentStep("upload");
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadedDocument(null);
    setTextFields([]);
    setEditedDocumentUrl(null);
    setShowTemplateSelector(false);
    setSelectedTemplate(null);
    setTemplatePhotoUrl(null);
    setTemplatePhotoFile(null);
  };

  const handleSelectTemplate = (template: IDTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    
    // Convert template fields to TextField format
    const fields: TextField[] = template.fields.map(field => ({
      id: field.id,
      label: field.label,
      value: field.value || "",
      originalValue: field.placeholder,
      editable: true
    }));
    
    setTextFields(fields);
    setPreviewUrl(null);
    setUploadedFile(null);
    setTemplatePhotoUrl(null);
    setTemplatePhotoFile(null);
    
    toast({
      title: "Template Selected",
      description: `${template.country} ${template.documentTypeLabel} - Now add your photo.`
    });
    
    // Go to photo step for template photo upload
    setCurrentStep("photo");
  };

  const handleTemplatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB max for photos)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum photo size is 5MB.",
          variant: "destructive"
        });
        return;
      }

      // Store as pending and show preview overlay
      setPendingPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPendingPhotoUrl(url);
      setShowPhotoPreview(true);
    }
  };

  const handleConfirmPhoto = () => {
    if (pendingPhotoUrl && pendingPhotoFile) {
      // Clean up old photo URL if exists
      if (templatePhotoUrl) {
        URL.revokeObjectURL(templatePhotoUrl);
      }
      
      setTemplatePhotoFile(pendingPhotoFile);
      setTemplatePhotoUrl(pendingPhotoUrl);
      setPendingPhotoFile(null);
      setPendingPhotoUrl(null);
      setShowPhotoPreview(false);
      
      toast({
        title: "Photo applied",
        description: "Your photo has been added to the template."
      });
    }
  };

  const handleCancelPhoto = () => {
    if (pendingPhotoUrl) {
      URL.revokeObjectURL(pendingPhotoUrl);
    }
    setPendingPhotoFile(null);
    setPendingPhotoUrl(null);
    setShowPhotoPreview(false);
  };

  const handleRemoveTemplatePhoto = () => {
    if (templatePhotoUrl) {
      URL.revokeObjectURL(templatePhotoUrl);
    }
    setTemplatePhotoUrl(null);
    setTemplatePhotoFile(null);
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
        // Show template selector if user clicked "Use Template"
        if (showTemplateSelector) {
          return (
            <div className="flex-1 flex items-center justify-center p-8">
              <TemplateSelector 
                onSelectTemplate={handleSelectTemplate}
                onClose={() => setShowTemplateSelector(false)}
              />
            </div>
          );
        }

        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-xl space-y-6">
              {/* Upload Option */}
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                  dragActive 
                    ? "border-accent bg-accent/10" 
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload Your Document
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Drag and drop your passport, ID, or driving license here
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileInput}
                />
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-5 h-5" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Supports JPG, PNG, PDF • Max 10MB
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Template Option */}
              <div 
                onClick={() => setShowTemplateSelector(true)}
                className="border-2 border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <LayoutTemplate className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Use a Template
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Choose from 20+ country templates for passports, IDs, and licenses
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xl">🇺🇸</span>
                  <span className="text-xl">🇬🇧</span>
                  <span className="text-xl">🇨🇦</span>
                  <span className="text-xl">🇩🇪</span>
                  <span className="text-xl">🇫🇷</span>
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-xl">🇯🇵</span>
                  <span className="text-xl">🇦🇺</span>
                  <span className="text-xs text-muted-foreground ml-1">+more</span>
                </div>
              </div>
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
        // Template photo upload mode
        if (selectedTemplate) {
          return (
            <div className="flex-1 grid lg:grid-cols-2 gap-6 p-6">
              {/* Template Preview with Photo */}
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Template Preview</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedTemplate.flag} {selectedTemplate.country} • {selectedTemplate.documentTypeLabel}
                    </p>
                  </div>
                </div>
                <div 
                  className="aspect-[3/2] rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedTemplate.colors.primary}, ${selectedTemplate.colors.secondary})` 
                  }}
                >
                  <div className="w-[90%] h-[85%] bg-white/95 rounded-lg shadow-lg flex flex-col p-4 relative">
                    {/* Document Header */}
                    <div 
                      className="text-xs font-bold mb-3 tracking-wider"
                      style={{ color: selectedTemplate.colors.primary }}
                    >
                      {selectedTemplate.documentTypeLabel.toUpperCase()} • {selectedTemplate.countryCode}
                    </div>
                    
                    <div className="flex gap-4 flex-1">
                      {/* Photo Area */}
                      <div className="w-1/3 aspect-[3/4] bg-secondary rounded-md flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                        {templatePhotoUrl ? (
                          <img 
                            src={templatePhotoUrl} 
                            alt="Your photo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Camera className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                            <span className="text-[10px] text-muted-foreground">Your Photo</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Fields Preview */}
                      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                        {textFields.slice(0, 6).map((field) => (
                          <div key={field.id} className="flex flex-col">
                            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">
                              {field.label.split('/')[0].trim()}
                            </span>
                            <span className="text-[10px] font-medium text-foreground truncate">
                              {field.value || field.originalValue}
                            </span>
                          </div>
                        ))}
                        {textFields.length > 6 && (
                          <span className="text-[8px] text-muted-foreground">
                            +{textFields.length - 6} more fields...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload Controls */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Add Your Photo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a passport-style photo for your {selectedTemplate.documentTypeLabel.toLowerCase()}
                  </p>
                  
                  {/* Photo Upload Area */}
                  <div className="mb-6">
                    {templatePhotoUrl ? (
                      <div className="space-y-4">
                        <div className="relative w-40 h-48 mx-auto rounded-lg overflow-hidden border-2 border-accent">
                          <img 
                            src={templatePhotoUrl} 
                            alt="Your photo" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={handleRemoveTemplatePhoto}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-destructive-foreground" />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-accent font-medium flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            Photo uploaded successfully
                          </p>
                          <input
                            type="file"
                            id="template-photo-replace"
                            className="hidden"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleTemplatePhotoUpload}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 cursor-pointer"
                            onClick={() => document.getElementById('template-photo-replace')?.click()}
                          >
                            Replace Photo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                          <Camera className="w-8 h-8 text-accent" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload a clear, front-facing photo
                        </p>
                        <input
                          type="file"
                          id="template-photo-upload"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleTemplatePhotoUpload}
                        />
                        <Button 
                          variant="accent" 
                          className="cursor-pointer"
                          onClick={() => document.getElementById('template-photo-upload')?.click()}
                        >
                          <Upload className="w-4 h-4" />
                          Choose Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                          JPG or PNG • Max 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Photo Requirements */}
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">Photo Requirements</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-accent" />
                        Clear, front-facing photo
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-accent" />
                        Plain white or light background
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-accent" />
                        No glasses or head coverings (unless religious)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-accent" />
                        Neutral expression, mouth closed
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleResetEditor}>
                    Back
                  </Button>
                  <Button 
                    variant="accent" 
                    className="flex-1" 
                    onClick={() => setCurrentStep("text")}
                  >
                    {templatePhotoUrl ? "Continue to Text Editing" : "Skip Photo for Now"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        // Original document photo editing mode
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
                    <div className="text-primary-foreground text-sm font-bold mb-4">
                      {selectedTemplate?.documentTypeLabel || "PASSPORT"}
                    </div>
                    <div className="flex gap-4 flex-1">
                      <div className="w-1/3 bg-secondary/20 rounded-md flex items-center justify-center overflow-hidden border-2 border-dashed border-accent">
                        {templatePhotoUrl ? (
                          <img 
                            src={templatePhotoUrl} 
                            alt="Your face photo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-accent" />
                        )}
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
                {(previewUrl || templatePhotoUrl) && (
                  <div className="absolute top-1/4 left-1/6 w-24 h-28 border-2 border-accent rounded-lg animate-pulse" />
                )}
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
                  <input
                    type="file"
                    id="face-photo-change"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleTemplatePhotoUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => document.getElementById('face-photo-change')?.click()}
                  >
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">All Detected Text Fields</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {textFields.length} fields detected
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Edit any field below. Changed fields will be highlighted.
              </p>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {textFields.length > 0 ? textFields.map((field) => {
                  const isEdited = field.value !== field.originalValue;
                  return (
                    <div 
                      key={field.id} 
                      className={`p-3 rounded-lg border transition-all ${
                        isEdited 
                          ? "border-accent bg-accent/5" 
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </label>
                        {isEdited && (
                          <span className="text-[10px] text-accent font-medium px-1.5 py-0.5 bg-accent/20 rounded">
                            EDITED
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          setTextFields(prev => 
                            prev.map(f => f.id === field.id ? { ...f, value: e.target.value } : f)
                          );
                        }}
                        className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder={field.originalValue || "Enter value..."}
                      />
                      {isEdited && field.originalValue && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-through">
                          Original: {field.originalValue}
                        </p>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No text fields detected. Upload a document to start.</p>
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
        const hasEdits = textFields.some(f => f.value !== f.originalValue);
        const changedFields = textFields.filter(f => f.value !== f.originalValue);
        
        const handleApplyEdits = async () => {
          if (!uploadedFile) {
            toast({
              title: "No document",
              description: "Please upload a document first.",
              variant: "destructive"
            });
            return;
          }

          toast({
            title: "Applying edits",
            description: "AI is updating your document with the new text..."
          });

          const originalFields = textFields.map(f => ({ 
            id: f.id, 
            label: f.label, 
            value: f.originalValue 
          }));
          const editedFields = textFields.map(f => ({ 
            id: f.id, 
            label: f.label, 
            value: f.value 
          }));

          const resultUrl = await applyEdits(uploadedFile, originalFields, editedFields);
          
          if (resultUrl) {
            setEditedDocumentUrl(resultUrl);
            setShowComparison(true);
            toast({
              title: "Edits applied",
              description: "Review your edited document below."
            });
          } else {
            toast({
              title: "Edit failed",
              description: editError || "Failed to apply edits. You can try again or download the original.",
              variant: "destructive"
            });
          }
        };

        const handleRetryEdits = async () => {
          if (!uploadedFile) return;

          toast({
            title: "Retrying edits",
            description: `Attempt ${currentAttempt + 1}: AI is re-processing your document...`
          });

          const originalFields = textFields.map(f => ({ 
            id: f.id, 
            label: f.label, 
            value: f.originalValue 
          }));
          const editedFields = textFields.map(f => ({ 
            id: f.id, 
            label: f.label, 
            value: f.value 
          }));

          const resultUrl = await retryEdits(uploadedFile, originalFields, editedFields);
          
          if (resultUrl) {
            setEditedDocumentUrl(resultUrl);
            toast({
              title: "Retry complete",
              description: "Check the updated result."
            });
          } else {
            toast({
              title: "Retry failed",
              description: editError || "Failed to apply edits. You can try again.",
              variant: "destructive"
            });
          }
        };

        const handleDownload = async (format: string) => {
          const downloadUrl = editedDocumentUrl || previewUrl;
          
          if (!downloadUrl) {
            toast({
              title: "No document",
              description: "Please upload a document first.",
              variant: "destructive"
            });
            return;
          }

          try {
            toast({
              title: "Preparing download",
              description: `Downloading as ${format}...`
            });

            // Fetch the image
            const response = await fetch(downloadUrl);
            const blob = await response.blob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            const fileName = uploadedFile?.name?.replace(/\.[^/.]+$/, "") || "document";
            link.download = `${fileName}-edited.${format.toLowerCase()}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Save to editing history if authenticated and not already saved
            if (isAuthenticated && !historySaved) {
              const documentName = uploadedFile?.name || (selectedTemplate ? `${selectedTemplate.country} ${selectedTemplate.documentTypeLabel}` : "Untitled Document");
              const documentType = selectedTemplate?.documentTypeLabel || "Custom Upload";
              const editedFields = changedFields.reduce((acc, field) => {
                acc[field.label] = { original: field.originalValue, new: field.value };
                return acc;
              }, {} as Record<string, { original: string; new: string }>);
              
              await saveToHistory({ documentName, documentType, editedFields });
              setHistorySaved(true);
            }

            toast({
              title: "Download complete",
              description: `Your document has been downloaded as ${format}.`
            });
          } catch (error) {
            console.error("Download error:", error);
            toast({
              title: "Download failed",
              description: "Failed to download document. Please try again.",
              variant: "destructive"
            });
          }
        };

        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
            <div className="w-full max-w-4xl">
              {/* Comparison View */}
              {showComparison && editedDocumentUrl && previewUrl && (
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Compare: Original vs Edited
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComparison(false)}
                    >
                      Hide Comparison
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Original */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground text-center">Original</div>
                      <div className="aspect-[3/2] bg-secondary rounded-lg">
                        <ZoomableImage 
                          src={previewUrl} 
                          alt="Original document" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    
                    {/* Edited */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-accent text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Edited
                      </div>
                      <div className="aspect-[3/2] bg-secondary rounded-lg border-2 border-accent">
                        <ZoomableImage 
                          src={editedDocumentUrl} 
                          alt="Edited document" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Changes Applied */}
                  <div className="bg-accent/10 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Changes Applied ({changedFields.length})</div>
                    <div className="space-y-1">
                      {changedFields.map((field) => (
                        <div key={field.id} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{field.label}:</span>
                          <span className="line-through text-destructive/60">{field.originalValue}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-accent font-medium">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retry Button */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {lastEditResult?.attempt && `Attempt ${lastEditResult.attempt}`}
                      {lastEditResult?.message && ` • ${lastEditResult.message}`}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryEdits}
                      disabled={isEditing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isEditing ? 'animate-spin' : ''}`} />
                      {isEditing ? 'Retrying...' : 'Not Satisfied? Retry'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Main Export Card */}
              <div className="bg-card rounded-xl border border-border p-8 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  {isEditing ? (
                    <Loader2 className="w-8 h-8 text-accent-foreground animate-spin" />
                  ) : editedDocumentUrl ? (
                    <Check className="w-8 h-8 text-accent-foreground" />
                  ) : (
                    <Download className="w-8 h-8 text-accent-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {isEditing 
                    ? `Applying Edits (Attempt ${currentAttempt || 1})...` 
                    : editedDocumentUrl 
                      ? "Document Ready!" 
                      : "Export Your Document"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isEditing 
                    ? "AI is carefully updating your document" 
                    : editedDocumentUrl 
                      ? "Your edited document is ready for download" 
                      : hasEdits 
                        ? `You have ${changedFields.length} text change(s) to apply` 
                        : "Download your document in your preferred format"}
                </p>

                {/* Show Apply Edits button if there are changes and not yet applied */}
                {hasEdits && !editedDocumentUrl && !isEditing && (
                  <Button 
                    variant="accent" 
                    size="lg" 
                    className="w-full mb-6"
                    onClick={handleApplyEdits}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Apply AI Edits ({changedFields.length} changes)
                  </Button>
                )}

                {/* Show loading state */}
                {isEditing && (
                  <div className="mb-6 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with AI (google/gemini-3-pro-image-preview)...</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This may take a few seconds for best quality
                    </p>
                  </div>
                )}

                {/* Error state with retry */}
                {editError && !isEditing && (
                  <div className="mb-6 p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive mb-2">{editError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetryEdits}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Download buttons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { format: "PNG", desc: "High Resolution" },
                    { format: "JPG", desc: "Compressed" },
                    { format: "PDF", desc: "Print Ready" }
                  ].map((option) => (
                    <Button 
                      key={option.format}
                      variant="outline" 
                      className="flex-col h-auto py-4"
                      onClick={() => handleDownload(option.format)}
                      disabled={isEditing}
                    >
                      <span className="font-bold">{option.format}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </Button>
                  ))}
                </div>

                {!editedDocumentUrl && hasEdits && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Download without edits, or click "Apply AI Edits" first
                  </p>
                )}

                <Button variant="ghost" onClick={handleResetEditor} disabled={isEditing}>
                  Edit Another Document
                </Button>
              </div>
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
            onedirham<span className="text-accent">.xyz</span>
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

        <div className="w-24 flex justify-end">
          <UserMenu />
        </div>
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

      {/* Photo Preview Overlay */}
      {showPhotoPreview && pendingPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-primary/10">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                Preview Photo
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review your photo before applying
              </p>
            </div>
            
            {/* Photo Preview */}
            <div className="p-6">
              <div className="relative aspect-[3/4] max-w-[240px] mx-auto rounded-xl overflow-hidden border-2 border-accent shadow-lg">
                <img 
                  src={pendingPhotoUrl} 
                  alt="Photo preview" 
                  className="w-full h-full object-cover"
                />
                {/* Face detection guide overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-accent/50 rounded-lg pointer-events-none" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-accent font-medium">
                  Face detected
                </div>
              </div>
              
              {/* Photo tips */}
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Tip:</span> Ensure your face is centered and clearly visible for best results.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t border-border bg-secondary/30 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancelPhoto}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="accent" 
                className="flex-1"
                onClick={handleConfirmPhoto}
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
