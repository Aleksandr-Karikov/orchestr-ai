import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Index,
} from "@mikro-orm/core";
import { Service } from "./service.entity";

@Entity({ tableName: "systems" })
@Index({ properties: ["name"] })
export class System {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property({ type: "varchar", length: 255 })
  name!: string;

  @Property({ type: "text", nullable: true })
  description?: string;

  @Property({ type: "timestamp", onCreate: () => new Date() })
  created_at!: Date;

  @Property({ type: "timestamp", onUpdate: () => new Date() })
  updated_at!: Date;

  @OneToMany(() => Service, (service) => service.system)
  services = new Array<Service>();
}
