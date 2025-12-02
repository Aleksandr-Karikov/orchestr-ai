import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Contract } from "./contract.entity";

@Entity("contract_versions")
export class ContractVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  contract_id!: string;

  @ManyToOne(() => Contract, (contract) => contract.versions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column({ type: "integer" })
  @Index(["contract_id", "version"])
  version!: number;

  @Column({ type: "jsonb" })
  snapshot!: Record<string, unknown>;

  @Column({ type: "text", nullable: true })
  change_summary?: string;

  @Column({ type: "boolean", default: false })
  @Index()
  is_current!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  created_by?: string;
}
