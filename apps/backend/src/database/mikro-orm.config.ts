import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ConfigService } from "@nestjs/config";
import {
  System,
  Service,
  Contract,
  ContractVersion,
  ServiceContractUsage,
} from "./entities";

export const getMikroOrmConfig = (
  configService?: ConfigService,
): MikroOrmModuleSyncOptions => {
  // Use ConfigService if available (NestJS context), otherwise use process.env (CLI)
  const getEnv = (key: string, defaultValue: string) => {
    if (configService) {
      return configService.get<string>(key, defaultValue);
    }
    return process.env[key] || defaultValue;
  };

  const getEnvNumber = (key: string, defaultValue: number) => {
    if (configService) {
      return configService.get<number>(key, defaultValue);
    }
    return parseInt(process.env[key] || String(defaultValue), 10);
  };

  return {
    driver: PostgreSqlDriver,
    host: getEnv("DB_HOST", "localhost"),
    port: getEnvNumber("DB_PORT", 5432),
    user: getEnv("DB_USERNAME", "postgres"),
    password: getEnv("DB_PASSWORD", "postgres"),
    dbName: getEnv("DB_DATABASE", "orchestr_ai"),
    entities: [
      System,
      Service,
      Contract,
      ContractVersion,
      ServiceContractUsage,
    ],
    migrations: {
      path: "./src/database/migrations",
      glob: "!(*.d).{js,ts}",
    },
    allowGlobalContext: true,
    debug: getEnv("NODE_ENV", "development") === "development",
    pool: {
      min: 2,
      max: 10,
    },
  };
};

// For CLI usage (migrations) - uses process.env
// NestJS ConfigModule automatically loads .env files when app starts
// For CLI, ensure .env is loaded via environment or use --env-file flag
const cliConfig: Options = getMikroOrmConfig() as Options;
export default cliConfig;
