import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { System } from './system.entity';
import { Contract } from './contract.entity';
import { ServiceContractUsage } from './service-contract-usage.entity';
import { IndexingStatus } from './indexing-status.enum';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  system_id!: string;

  @ManyToOne(() => System, (system) => system.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'system_id' })
  system!: System;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  repository_url!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  repository_path?: string;

  @Column({ type: 'timestamp', nullable: true })
  last_indexed_at?: Date;

  @Column({
    type: 'enum',
    enum: IndexingStatus,
    default: IndexingStatus.PENDING,
  })
  indexing_status!: IndexingStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @OneToMany(() => Contract, (contract) => contract.service)
  contracts!: Contract[];

  @OneToMany(() => ServiceContractUsage, (usage) => usage.consumerService)
  contractUsages!: ServiceContractUsage[];
}
