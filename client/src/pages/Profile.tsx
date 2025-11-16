import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  FileText, 
  Clock, 
  Hash,
  ExternalLink,
  AlertCircle,
  Wallet,
  Plus
} from "lucide-react";
import type { CVProof } from "@shared/schema";

export default function Profile() {
  const currentAccount = useCurrentAccount();

  const { data: proofs, isLoading } = useQuery<CVProof[]>({
    queryKey: ["/api/proofs/wallet", currentAccount?.address],
    enabled: !!currentAccount?.address,
  });

  if (!currentAccount) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Connect Your Wallet</h2>
              <p className="mb-6 text-muted-foreground max-w-md">
                Please connect your wallet to view your registered CVs and manage your blockchain proofs.
              </p>
              <Link href="/">
                <Button data-testid="button-go-home" asChild>
                  <span>Go to Home</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const truncateHash = (hash: string, startChars = 12, endChars = 12) => {
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                View and manage your registered CV proofs
              </p>
            </div>
            <Link href="/register">
              <Button className="gap-2" data-testid="button-register-new-cv">
                <Plus className="h-4 w-4" />
                Register New CV
              </Button>
            </Link>
          </div>

          {/* Wallet Info Card */}
          <Card className="border-card-border bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Connected Wallet</p>
                  <p className="font-mono text-sm break-all" data-testid="text-wallet-address">
                    {currentAccount.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CV Proofs List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Registered CVs {proofs && `(${proofs.length})`}
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-card-border">
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : proofs && proofs.length > 0 ? (
            <div className="space-y-4">
              {proofs.map((proof) => (
                <Card key={proof.id} className="border-card-border hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">CV Proof</CardTitle>
                          <Badge 
                            className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                            data-testid={`badge-verified-${proof.id}`}
                          >
                            <Shield className="h-3 w-3" />
                            Verified
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(proof.createdAt)}
                        </CardDescription>
                      </div>
                      <FileText className="h-6 w-6 shrink-0 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Hash */}
                    <div className="flex items-start gap-2 rounded-lg border border-card-border bg-muted/30 p-3">
                      <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">File Hash</p>
                        <p className="font-mono text-xs break-all" data-testid={`text-hash-${proof.id}`}>
                          {truncateHash(proof.fileHash, 16, 16)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link href={`/p/${proof.proofCode}`}>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 sm:flex-1"
                          data-testid={`button-view-proof-${proof.id}`}
                          asChild
                        >
                          <span>
                            <Shield className="h-4 w-4" />
                            View Proof
                          </span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full gap-2 sm:flex-1"
                        onClick={() => window.open(`/api/cv/${proof.contentId}`, "_blank")}
                        data-testid={`button-view-cv-${proof.id}`}
                      >
                        <FileText className="h-4 w-4" />
                        View CV
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-card-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No CVs Registered Yet</h3>
                <p className="mb-6 text-sm text-muted-foreground max-w-md">
                  You haven't registered any CVs yet. Start by uploading your first CV to create a blockchain-backed proof.
                </p>
                <Link href="/register">
                  <Button className="gap-2" data-testid="button-register-first-cv">
                    <Plus className="h-4 w-4" />
                    Register Your First CV
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
