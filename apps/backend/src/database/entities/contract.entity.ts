import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Service } from './service.entity';
import { ContractVersion } from './contract-version.entity';
import { ServiceContractUsage } from './service-contract-usage.entity';
import { SourceType } from './source-type.enum';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  service_id!: string;

  @ManyToOne(() => Service, (service) => service.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 10 })
  http_method!: string;

  @Column({ type: 'varchar', length: 500 })
  @Index(['http_method', 'path'])
  path!: string;

  @Column({ type: 'jsonb', nullable: true })
  request_schema?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  response_schema?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: SourceType,
    default: SourceType.MANUAL,
  })
  source_type!: SourceType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  source_file?: string;

  @Column({ type: 'integer', nullable: true })
  source_line?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  extraction_confidence?: number;

  @Column({ type: 'uuid', nullable: true })
  current_version_id?: string;

  @ManyToOne(() => ContractVersion, { nullable: true })
  @JoinColumn({ name: 'current_version_id' })
  currentVersion?: ContractVersion;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => ContractVersion, (version) => version.contract)
  versions!: ContractVersion[];

  @OneToMany(() => ServiceContractUsage, (usage) => usage.contract)
  usages!: ServiceContractUsage[];
}

