import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/CopyButton";
import { 
  Shield, 
  Clock, 
  Hash,
  AlertCircle,
  Wallet,
  Lock,
  Unlock,
  FileText,
  ExternalLink,
  Key
} from "lucide-react";
import type { CVProof } from "@shared/schema";

export default function ProofView() {
  const [, params] = useRoute("/p/:proofCode");
  const proofCode = params?.proofCode || "";
  
  // Mock wallet state (in production, this would use real wallet connection)
  const [mockWalletAddress, setMockWalletAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [decryptedPdfUrl, setDecryptedPdfUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // Fetch proof metadata
  const { data: proof, isLoading, error } = useQuery<CVProof>({
    queryKey: ["/api/proof", proofCode],
    enabled: !!proofCode,
  });

  const handleMockWalletConnect = () => {
    if (!mockWalletAddress.trim()) {
      alert("Please enter a wallet address");
      return;
    }
    setIsWalletConnected(true);
  };

  const handleDecryptAndView = async () => {
    if (!proof) return;
    
    setIsDecrypting(true);
    setDecryptError(null);

    try {
      const viewerAddress = mockWalletAddress || 'anonymous';
      const url = `/api/proof/${proofCode}/decrypted?viewerAddress=${encodeURIComponent(viewerAddress)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. You are not authorized to view this CV.");
        }
        throw new Error("Failed to decrypt CV");
      }

      // Create a blob URL for the decrypted PDF
      const pdfBlob = await response.blob();
      const blobUrl = URL.createObjectURL(pdfBlob);
      setDecryptedPdfUrl(blobUrl);
    } catch (err) {
      console.error("Decryption error:", err);
      setDecryptError(err instanceof Error ? err.message : "Failed to decrypt CV");
    } finally {
      setIsDecrypting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Proof Not Found</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-md">
                The CV proof you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-go-home">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl">
        {/* Proof Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">CV Proof Verification</h1>
          </div>
          <p className="text-muted-foreground">
            Blockchain-verified CV with encrypted storage
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proof Status Card */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                      <Shield className="h-5 w-5" />
                      Proof Verified
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2 text-green-700 dark:text-green-500">
                      <Clock className="h-3.5 w-3.5" />
                      Registered {formatDate(proof.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700">
                    <Lock className="h-3 w-3" />
                    Encrypted
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Mock Wallet Connect (MVP) */}
            {!isWalletConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Wallet to View CV
                  </CardTitle>
                  <CardDescription>
                    Enter your wallet address to request decryption access (mock for MVP)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      placeholder="0x..."
                      value={mockWalletAddress}
                      onChange={(e) => setMockWalletAddress(e.target.value)}
                      data-testid="input-wallet-address"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 For MVP demo: Access is auto-approved. In production, this uses Seal access control.
                    </p>
                  </div>
                  <Button 
                    onClick={handleMockWalletConnect}
                    className="w-full gap-2"
                    data-testid="button-connect-wallet"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet (Mock)
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Wallet Connected
                  </CardTitle>
                  <CardDescription className="font-mono text-xs break-all">
                    {mockWalletAddress}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!decryptedPdfUrl ? (
                    <>
                      {decryptError && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{decryptError}</p>
                          </div>
                        </div>
                      )}
                      <Button 
                        onClick={handleDecryptAndView}
                        disabled={isDecrypting}
                        className="w-full gap-2"
                        size="lg"
                        data-testid="button-decrypt-view"
                      >
                        {isDecrypting ? (
                          <>
                            <Key className="h-4 w-4 animate-spin" />
                            Decrypting CV...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Decrypt & View CV
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        🔒 CV is encrypted with Seal. Access control verified on-chain.
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-3">
                        <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-400">
                          CV successfully decrypted and loaded
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => window.open(decryptedPdfUrl, "_blank")}
                        data-testid="button-open-new-tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* PDF Viewer */}
            {decryptedPdfUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Decrypted CV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                      src={decryptedPdfUrl}
                      className="w-full h-full"
                      title="Decrypted CV"
                      data-testid="iframe-cv"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Proof Details */}
          <div className="space-y-6">
            {/* Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs break-all text-muted-foreground" data-testid="text-owner">
                  {proof.walletAddress}
                </p>
              </CardContent>
            </Card>

            {/* Proof Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proof Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-mono text-xs break-all text-muted-foreground" data-testid="text-proof-code">
                  {truncateHash(proof.proofCode, 8, 8)}
                </p>
                <CopyButton text={proof.proofCode} label="Copy Code" />
              </CardContent>
            </Card>

            {/* File Hash */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  File Hash
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs break-all text-muted-foreground" data-testid="text-file-hash">
                  {truncateHash(proof.fileHash, 10, 10)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  SHA-256 hash of original PDF
                </p>
              </CardContent>
            </Card>

            {/* Seal Object */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Seal Object
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs break-all text-muted-foreground" data-testid="text-seal-object">
                  {truncateHash(proof.sealObjectId, 10, 10)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Encryption policy object ID
                </p>
              </CardContent>
            </Card>

            {/* Transaction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs break-all text-muted-foreground mb-2" data-testid="text-tx-hash">
                  {truncateHash(proof.txHash, 8, 8)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(`https://suiscan.xyz/testnet/tx/${proof.txHash}`, "_blank")}
                  data-testid="button-view-tx"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Suiscan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
