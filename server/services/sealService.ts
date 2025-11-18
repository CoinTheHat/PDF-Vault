import crypto from 'crypto';

/**
 * Seal Service - Handles CV encryption/decryption with access control
 * 
 * MOCK IMPLEMENTATION:
 * This is a mock implementation using Node.js crypto for AES-256-GCM encryption.
 * In production, replace with the actual Seal SDK for Sui-based access control.
 * 
 * Real Seal Integration (when SDK is available):
 * - Use Seal SDK to create policy objects on Sui
 * - Implement on-chain access control rules
 * - Generate decryption keys based on wallet signatures
 * - Integrate with Sui wallet for identity verification
 * 
 * Documentation: https://docs.seal.io (when available)
 */

interface EncryptCVParams {
  pdfBytes: Buffer;
  ownerAddress: string;
  policy?: {
    allowedViewers?: string[];
    secretAccessCode?: string;
    requireApproval?: boolean;
  };
}

interface EncryptCVResult {
  ciphertext: Buffer;
  sealObjectId: string;
  // NOTE: encryptionKey is NOT returned - it's stored internally/on-chain only
}

interface GetDecryptionKeyParams {
  sealObjectId: string;
  viewerAddress?: string;
  secretAccessCode?: string;
}

interface GetDecryptionKeyResult {
  decryptKey: string;
  approved: boolean;
}

interface DecryptCVParams {
  ciphertext: Buffer;
  decryptKey: string;
}

/**
 * Mock Seal Service
 * 
 * In production, this would interact with Seal smart contracts on Sui
 * to manage encryption keys and access policies.
 */
class SealService {
  private ALGORITHM = 'aes-256-gcm';
  private IV_LENGTH = 16;
  private AUTH_TAG_LENGTH = 16;
  
  // Mock storage for Seal objects (in production, this would be on-chain)
  private sealObjects = new Map<string, {
    ownerAddress: string;
    encryptionKey: string;
    policy: any;
    createdAt: Date;
  }>();

  /**
   * Encrypt a CV PDF using Seal
   * 
   * MOCK: Uses AES-256-GCM encryption with a random key
   * REAL: Would call Seal SDK to:
   * 1. Create a Seal policy object on Sui
   * 2. Encrypt the PDF using Seal's encryption scheme
   * 3. Store the encryption metadata on-chain
   * 
   * Example real implementation:
   * ```
   * const sealClient = new SealClient(suiProvider);
   * const result = await sealClient.encryptData({
   *   data: pdfBytes,
   *   owner: ownerAddress,
   *   policy: {
   *     type: 'approval-based',
   *     approvers: [ownerAddress],
   *   }
   * });
   * ```
   */
  async encryptCV(params: EncryptCVParams): Promise<EncryptCVResult> {
    const { pdfBytes, ownerAddress, policy } = params;

    // Generate a random encryption key (32 bytes for AES-256)
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    // Generate random IV
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      Buffer.from(encryptionKey, 'hex'),
      iv
    );
    
    // Encrypt the PDF
    const encrypted = Buffer.concat([
      cipher.update(pdfBytes),
      cipher.final()
    ]);
    
    // Get authentication tag
    const authTag = (cipher as any).getAuthTag();
    
    // Combine IV + encrypted data + auth tag
    const ciphertext = Buffer.concat([iv, encrypted, authTag]);
    
    // Generate a mock Seal object ID (in production, this would be a Sui object ID)
    const sealObjectId = `seal_${crypto.randomBytes(16).toString('hex')}`;
    
    // Store the Seal object metadata (in production, this would be on-chain)
    this.sealObjects.set(sealObjectId, {
      ownerAddress,
      encryptionKey,
      policy: policy || { allowedViewers: [], secretAccessCode: undefined, requireApproval: false },
      createdAt: new Date()
    });

    console.log(`[Seal Mock] Created Seal object ${sealObjectId} for owner ${ownerAddress}`);
    console.log(`[Seal Mock] Encrypted ${pdfBytes.length} bytes → ${ciphertext.length} bytes`);

    return {
      ciphertext,
      sealObjectId
      // encryptionKey is stored internally - NEVER exposed to caller
    };
  }

  /**
   * Get decryption key for a viewer
   * 
   * MOCK: Always approves and returns the stored encryption key
   * REAL: Would call Seal SDK to:
   * 1. Verify viewer's wallet signature
   * 2. Check access policy on-chain
   * 3. Generate/return a decryption key only if policy allows
   * 
   * Example real implementation:
   * ```
   * const sealClient = new SealClient(suiProvider);
   * const result = await sealClient.requestAccess({
   *   sealObjectId,
   *   requester: viewerAddress,
   *   signature: await wallet.signMessage('Request CV access')
   * });
   * ```
   */
  async getDecryptionKey(params: GetDecryptionKeyParams): Promise<GetDecryptionKeyResult> {
    const { sealObjectId, viewerAddress, secretAccessCode } = params;

    console.log(`[Seal Mock] Access request for ${sealObjectId}`);
    if (viewerAddress) console.log(`  - Via wallet: ${viewerAddress}`);
    if (secretAccessCode) console.log(`  - Via secret code: ${secretAccessCode.substring(0, 8)}...`);

    const sealObject = this.sealObjects.get(sealObjectId);
    
    if (!sealObject) {
      throw new Error(`Seal object not found: ${sealObjectId}`);
    }

    // MOCK: Check access via wallet OR secret code
    // REAL: Check on-chain policy and require wallet signature
    const { policy, ownerAddress } = sealObject;
    
    // Method 1: Secret access code (if provided and matches)
    if (secretAccessCode && policy.secretAccessCode) {
      if (secretAccessCode === policy.secretAccessCode) {
        console.log(`[Seal Mock] ✓ Access granted via secret code`);
        return {
          decryptKey: sealObject.encryptionKey,
          approved: true
        };
      } else {
        console.log(`[Seal Mock] ✗ Invalid secret code`);
        throw new Error(`Access denied. Invalid secret access code.`);
      }
    }
    
    // Method 2: Wallet-based access control (owner or allowed viewers)
    if (viewerAddress) {
      const isOwner = viewerAddress.toLowerCase() === ownerAddress.toLowerCase();
      const isAllowedViewer = policy.allowedViewers?.some(
        (addr: string) => addr.toLowerCase() === viewerAddress.toLowerCase()
      ) || false;
      const approved = isOwner || isAllowedViewer || !policy.requireApproval;

      if (!approved) {
        console.log(`[Seal Mock] ✗ Access denied for ${viewerAddress}`);
        throw new Error(`Access denied. Wallet ${viewerAddress} is not authorized to decrypt this CV.`);
      }

      console.log(`[Seal Mock] ✓ Access granted for ${viewerAddress} (${isOwner ? 'owner' : 'allowed viewer'})`);
      
      return {
        decryptKey: sealObject.encryptionKey,
        approved: true
      };
    }

    // No valid authentication method provided
    throw new Error(`Access denied. Please provide either a wallet address or secret access code.`);
  }

  /**
   * Decrypt CV using decryption key
   * 
   * MOCK: Uses AES-256-GCM decryption
   * REAL: Would use Seal's decryption scheme
   * 
   * Example real implementation:
   * ```
   * const sealClient = new SealClient(suiProvider);
   * const pdfBytes = await sealClient.decrypt({
   *   ciphertext,
   *   decryptionKey: result.key
   * });
   * ```
   */
  async decryptCV(params: DecryptCVParams): Promise<Buffer> {
    const { ciphertext, decryptKey } = params;

    // Extract IV, encrypted data, and auth tag
    const iv = ciphertext.subarray(0, this.IV_LENGTH);
    const authTag = ciphertext.subarray(ciphertext.length - this.AUTH_TAG_LENGTH);
    const encrypted = ciphertext.subarray(this.IV_LENGTH, ciphertext.length - this.AUTH_TAG_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      Buffer.from(decryptKey, 'hex'),
      iv
    );
    
    (decipher as any).setAuthTag(authTag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    console.log(`[Seal Mock] Decrypted ${ciphertext.length} bytes → ${decrypted.length} bytes`);

    return decrypted;
  }

  /**
   * Verify ciphertext hash
   * Useful for proving the CV hasn't been tampered with
   */
  computeCiphertextHash(ciphertext: Buffer): string {
    return crypto.createHash('sha256').update(ciphertext).digest('hex');
  }
}

// Export singleton instance
export const sealService = new SealService();
