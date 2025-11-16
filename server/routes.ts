import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { createHash } from "crypto";
import { storage } from "./storage";
import { uploadCVToWalrus } from "./services/walrusService";
import { registerCVProofOnSui } from "./services/suiService";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Validation schema for registration
const registerSchema = z.object({
  walletAddress: z.string().min(10, "Wallet address must be at least 10 characters"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/proof/register
   * 
   * Registers a new CV proof
   * - Accepts PDF file upload and wallet address
   * - Computes SHA-256 hash of the CV
   * - Uploads CV to Walrus (mocked)
   * - Registers proof on Sui blockchain (mocked)
   * - Stores proof record in storage
   */
  app.post("/api/proof/register", upload.single("cvFile"), async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ message: "CV file is required" });
      }

      // Validate request body
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid wallet address",
          errors: validation.error.errors,
        });
      }

      const { walletAddress } = validation.data;
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      console.log(`\n=== Starting CV Registration ===`);
      console.log(`File: ${fileName} (${fileBuffer.length} bytes)`);
      console.log(`Wallet: ${walletAddress}`);

      // Step 1: Compute file hash (SHA-256)
      const fileHash = createHash("sha256").update(fileBuffer).digest("hex");
      console.log(`File Hash: ${fileHash}`);

      // Step 2: Upload to Walrus (mocked)
      const { contentId, storageUrl } = await uploadCVToWalrus(fileBuffer, fileName);

      // Step 3: Register on Sui blockchain (mocked)
      const { txHash, proofCode } = await registerCVProofOnSui({
        fileHash,
        contentId,
        walletAddress,
      });

      // Step 4: Store proof record in storage
      const proof = await storage.createCVProof({
        walletAddress,
        fileHash,
        contentId,
        storageUrl,
        txHash,
        proofCode,
      });

      console.log(`Proof Code: ${proofCode}`);
      console.log(`=== Registration Complete ===\n`);

      res.status(201).json(proof);
    } catch (error) {
      console.error("Error registering CV proof:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to register CV proof",
      });
    }
  });

  /**
   * GET /api/proof/:proofCode
   * 
   * Retrieves a CV proof by proof code
   * - Returns proof details if found
   * - Returns 404 if not found
   */
  app.get("/api/proof/:proofCode", async (req, res) => {
    try {
      const { proofCode } = req.params;

      console.log(`\n=== Retrieving Proof ===`);
      console.log(`Proof Code: ${proofCode}`);

      const proof = await storage.getCVProofByCode(proofCode);

      if (!proof) {
        console.log(`Proof not found`);
        console.log(`=== Retrieval Failed ===\n`);
        return res.status(404).json({ message: "Proof not found" });
      }

      console.log(`Proof found for wallet: ${proof.walletAddress}`);
      console.log(`=== Retrieval Complete ===\n`);

      res.json(proof);
    } catch (error) {
      console.error("Error retrieving CV proof:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to retrieve CV proof",
      });
    }
  });

  /**
   * GET /api/proofs/wallet/:walletAddress
   * 
   * Retrieves all CV proofs for a specific wallet address
   * - Returns array of proofs
   * - Returns empty array if none found
   */
  app.get("/api/proofs/wallet/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;

      console.log(`\n=== Retrieving Proofs by Wallet ===`);
      console.log(`Wallet: ${walletAddress}`);

      const proofs = await storage.getCVProofsByWallet(walletAddress);

      console.log(`Found ${proofs.length} proof(s)`);
      console.log(`=== Retrieval Complete ===\n`);

      res.json(proofs);
    } catch (error) {
      console.error("Error retrieving CV proofs:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to retrieve CV proofs",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
