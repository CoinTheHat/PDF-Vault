import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, AlertCircle, Loader2, Shield, Clock, Hash, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CVProof } from "@shared/schema";

export default function ProofDisplay() {
  const params = useParams();
  const proofCode = params.proofCode as string;

  const { data: proof, isLoading, error } = useQuery<CVProof>({
    queryKey: ["/api/proof", proofCode],
    enabled: !!proofCode,
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-card-border">
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              No CV proof found for code: <code className="font-mono">{proofCode}</code>
            </AlertDescription>
          </Alert>

          <Card className="border-card-border text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Proof Not Found</h2>
              <p className="mb-6 text-muted-foreground">
                The proof code you entered does not match any registered CV. Please check the code and try again.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/verify">
                  <Button variant="outline" data-testid="button-try-again" asChild>
                    <span>Try Another Code</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register-cv" asChild>
                    <span>Register Your CV</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(proof.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const truncateHash = (hash: string, startChars = 12, endChars = 12) => {
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        {/* Verification Badge */}
        <div className="mb-6 flex justify-center">
          <Badge className="gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" data-testid="badge-verified">
            <CheckCircle2 className="h-4 w-4" />
            Verified On-Chain Proof
          </Badge>
        </div>

        {/* Main Proof Card */}
        <Card className="mb-6 border-card-border">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">CV Proof Details</CardTitle>
                <CardDescription>
                  This CV has been verified and registered with blockchain-backed proof.
                </CardDescription>
              </div>
              <Shield className="h-8 w-8 shrink-0 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Address */}
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-muted/30 p-4">
              <Shield className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Wallet Address</p>
                <p className="font-mono text-sm break-all" data-testid="text-proof-wallet">
                  {proof.walletAddress}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-muted/30 p-4">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Registration Time</p>
                <p className="text-sm" data-testid="text-proof-timestamp">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* File Hash */}
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-muted/30 p-4">
              <Hash className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium text-muted-foreground">File Hash (SHA-256)</p>
                <p className="font-mono text-xs break-all sm:text-sm" data-testid="text-proof-hash">
                  {proof.fileHash}
                </p>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-muted/30 p-4">
              <Database className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-xs break-all sm:text-sm" data-testid="text-proof-txhash">
                  {proof.txHash}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Document Access Card */}
        <Card className="mb-6 border-card-border">
          <CardHeader>
            <CardTitle className="text-lg">CV Document</CardTitle>
            <CardDescription>
              Access the verified CV stored on decentralized storage (Walrus).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full h-12 text-base"
              onClick={() => window.open(`/api/cv/${proof.contentId}`, "_blank")}
              data-testid="button-view-cv"
            >
              View CV Document
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Content ID: <code className="font-mono">{truncateHash(proof.contentId, 8, 8)}</code>
            </p>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-card-border bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-primary" />
              Security & Verification
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>This CV has been cryptographically hashed and verified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>The proof record is stored on the Sui blockchain (mocked)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>The CV document is stored on Walrus decentralized storage (mocked)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>Any modification to the CV would result in a different hash</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
