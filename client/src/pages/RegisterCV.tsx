import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Upload, Loader2, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const registerFormSchema = z.object({
  walletAddress: z.string().min(10, "Wallet address must be at least 10 characters").regex(/^0x[a-fA-F0-9]+$|^[a-fA-F0-9]+$/, "Please enter a valid wallet address"),
  cvFile: z.instanceof(File).refine((file) => file.type === "application/pdf", "Only PDF files are allowed"),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterCV() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      walletAddress: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const formData = new FormData();
      formData.append("cvFile", data.cvFile);
      formData.append("walletAddress", data.walletAddress);

      const response = await fetch("/api/proof/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register CV");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "CV Registered Successfully",
        description: "Your CV has been registered with blockchain proof.",
      });
      setLocation(`/success/${data.proofCode}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      form.setValue("cvFile", file);
      form.clearErrors("cvFile");
    }
  };

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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-2xl">Register Your CV</CardTitle>
            <CardDescription>
              Upload your CV and generate blockchain-backed proof for instant verification by recruiters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="cvFile"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>CV Document (PDF)</FormLabel>
                      <FormControl>
                        <div
                          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                            dragActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${selectedFile ? "bg-muted/30" : ""}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            {...field}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(file);
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            data-testid="input-cv-file"
                          />
                          
                          {selectedFile ? (
                            <div className="flex items-center gap-3 text-center">
                              <FileText className="h-10 w-10 text-primary" />
                              <div>
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                              <p className="mb-2 text-sm font-medium">
                                Drop your PDF here or click to browse
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PDF files only, up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Wallet Address */}
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="0x..."
                            className="pl-10 h-12"
                            data-testid="input-wallet-address"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your blockchain wallet address to claim ownership of this CV proof.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={registerMutation.isPending}
                  data-testid="button-submit-registration"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Register CV
                      <Upload className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-card-border bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="mb-3 font-semibold">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Your CV will be uploaded to decentralized storage (Walrus)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>A cryptographic hash of your CV will be computed for verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>A proof record will be registered on the Sui blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You'll receive a shareable link and proof code for recruiters</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
