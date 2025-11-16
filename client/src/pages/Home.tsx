import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Link as LinkIcon, CheckCircle2, Upload, Search, FileCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Blockchain-Backed Verification
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tamper-Proof CV Verification
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Register your CV with on-chain proof and give recruiters instant, verifiable credentials. 
              Secure, transparent, and trusted by design.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="button-hero-register" asChild>
                  <span className="flex items-center">
                    Register CV
                    <Upload className="ml-2 h-5 w-5" />
                  </span>
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" data-testid="button-hero-verify" asChild>
                  <span className="flex items-center">
                    Verify CV
                    <Search className="ml-2 h-5 w-5" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-semibold">Why Choose On-Chain CV Proof?</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-card-border">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Tamper-Proof Security</h3>
                <p className="text-muted-foreground">
                  Your CV is hashed and stored with blockchain verification, making it impossible to forge or modify.
                </p>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Decentralized Storage</h3>
                <p className="text-muted-foreground">
                  CVs are stored on Walrus, ensuring permanent availability without relying on central servers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Instant Verification</h3>
                <p className="text-muted-foreground">
                  Recruiters can verify authenticity in seconds using a simple shareable link or proof code.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-semibold">How It Works</h2>
          
          <div className="grid gap-12 lg:grid-cols-2">
            {/* For Candidates */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold">For Candidates</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Upload Your CV</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload your CV as a PDF file to our secure platform.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Provide Wallet Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter your blockchain wallet address to claim ownership.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Get Proof Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive a unique proof code and shareable link for verification.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Share with Recruiters</h4>
                    <p className="text-sm text-muted-foreground">
                      Include the proof link in your job applications for instant credibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Recruiters */}
            <div>
              <h3 className="mb-6 text-2xl font-semibold">For Recruiters</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Receive Proof Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Candidates share their unique verification link with you.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Verify Authenticity</h4>
                    <p className="text-sm text-muted-foreground">
                      View blockchain proof details including wallet, timestamp, and hash.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Access CV Document</h4>
                    <p className="text-sm text-muted-foreground">
                      Download the verified CV directly from decentralized storage.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Hire with Confidence</h4>
                    <p className="text-sm text-muted-foreground">
                      Make informed decisions based on verified, tamper-proof credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join the future of verifiable credentials with blockchain-backed CV proof.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-12 px-8" data-testid="button-cta-register" asChild>
                <span className="flex items-center">
                  Register Your CV Now
                  <FileCheck className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
