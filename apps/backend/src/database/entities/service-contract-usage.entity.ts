import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Service } from './service.entity';
import { Contract } from './contract.entity';
import { ContractVersion } from './contract-version.entity';
import { UsageType } from './usage-type.enum';
import { DetectionMethod } from './detection-method.enum';

@Entity('service_contract_usage')
@Index(['consumer_service_id', 'contract_id'])
export class ServiceContractUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  consumer_service_id!: string;

  @ManyToOne(() => Service, (service) => service.contractUsages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_service_id' })
  consumerService!: Service;

  @Column({ type: 'uuid' })
  @Index()
  contract_id!: string;

  @ManyToOne(() => Contract, (contract) => contract.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @Column({ type: 'uuid', nullable: true })
  contract_version_id?: string;

  @ManyToOne(() => ContractVersion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contract_version_id' })
  contractVersion?: ContractVersion;

  @Column({
    type: 'enum',
    enum: UsageType,
    default: UsageType.MANUAL,
  })
  usage_type!: UsageType;

  @Column({
    type: 'enum',
    enum: DetectionMethod,
    default: DetectionMethod.MANUAL,
  })
  detection_method!: DetectionMethod;

  @CreateDateColumn({ type: 'timestamp' })
  detected_at!: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;
}

