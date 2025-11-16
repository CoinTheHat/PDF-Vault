import { type User, type InsertUser, type CVProof, type InsertCVProof } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (legacy - can be removed if not needed)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // CV Proof methods
  createCVProof(proof: InsertCVProof): Promise<CVProof>;
  getCVProofByCode(proofCode: string): Promise<CVProof | undefined>;
  getCVProofsByWallet(walletAddress: string): Promise<CVProof[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cvProofs: Map<string, CVProof>;

  constructor() {
    this.users = new Map();
    this.cvProofs = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // CV Proof methods
  async createCVProof(insertProof: InsertCVProof): Promise<CVProof> {
    const id = randomUUID();
    const proof: CVProof = {
      ...insertProof,
      id,
      createdAt: new Date(),
    };
    this.cvProofs.set(proof.proofCode, proof);
    return proof;
  }

  async getCVProofByCode(proofCode: string): Promise<CVProof | undefined> {
    return this.cvProofs.get(proofCode);
  }

  async getCVProofsByWallet(walletAddress: string): Promise<CVProof[]> {
    return Array.from(this.cvProofs.values()).filter(
      (proof) => proof.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }
}

export const storage = new MemStorage();
