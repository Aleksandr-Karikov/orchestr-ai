import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MikroORM, EntityManager } from "@mikro-orm/core";
import { AppModule } from "../src/app.module";
import { getMikroOrmConfig } from "../src/database/mikro-orm.config";

/**
 * Test database configuration
 * Uses a separate test database to avoid conflicts with development data
 */
export const getTestDatabaseConfig = () => {
  const testDbName = process.env.DB_DATABASE_TEST || "orchestr_ai_test";
  return {
    ...getMikroOrmConfig(),
    dbName: testDbName,
    allowGlobalContext: true,
  };
};

/**
 * Creates a test application instance with proper setup
 */
export async function createTestApp(): Promise<INestApplication> {
  // Set test database name in environment
  process.env.DB_DATABASE = process.env.DB_DATABASE_TEST || "orchestr_ai_test";

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply global validation pipe (same as main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix (same as main.ts)
  app.setGlobalPrefix("api");

  await app.init();
  return app;
}

/**
 * Gets MikroORM instance from the NestJS application
 */
export function getOrmFromApp(app: INestApplication): MikroORM {
  return app.get(MikroORM);
}

/**
 * Gets EntityManager from the NestJS application
 */
export function getEmFromApp(app: INestApplication): EntityManager {
  return app.get(EntityManager);
}

/**
 * Cleans up the test database by removing all data
 */
export async function cleanupDatabase(em: EntityManager): Promise<void> {
  // Delete in reverse order of dependencies to avoid foreign key constraints
  await em.nativeDelete("service_contract_usage", {});
  await em.nativeDelete("contract_versions", {});
  await em.nativeDelete("contracts", {});
  await em.nativeDelete("services", {});
  await em.nativeDelete("systems", {});

  await em.flush();
}

/**
 * Sets up test database and returns ORM instance
 * This is used when you need to set up the database before creating the app
 */
export async function setupTestDatabase(): Promise<MikroORM> {
  const config = getTestDatabaseConfig();
  const orm = await MikroORM.init(config);

  // Run migrations to ensure schema is up to date
  const migrator = orm.getMigrator();
  await migrator.up();

  // Clean up any existing data
  const em = orm.em.fork();
  await cleanupDatabase(em);

  return orm;
}

/**
 * Closes test database connection
 */
export async function closeTestDatabase(orm: MikroORM): Promise<void> {
  const em = orm.em.fork();
  await cleanupDatabase(em);
  await orm.close(true);
}
