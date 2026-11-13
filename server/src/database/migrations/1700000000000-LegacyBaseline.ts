import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * The schema as it existed while the app still relied on TypeORM's
 * `synchronize: true`. Databases created in that era already have these
 * tables, so the migration is a no-op for them; a brand new database gets the
 * same starting point and then follows the same upgrade path.
 */
export class LegacyBaseline1700000000000 implements MigrationInterface {
  name = 'LegacyBaseline1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user')) return

    await queryRunner.query(`
      CREATE TYPE "transaction_transactiontype_enum" AS ENUM ('buy', 'sell')
    `)
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "username" text NOT NULL UNIQUE,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL
      )
    `)
    await queryRunner.query(`
      CREATE TABLE "asset" (
        "id" SERIAL PRIMARY KEY,
        "assetId" integer,
        "name" text NOT NULL,
        "ticker" text NOT NULL,
        "current_price" numeric NOT NULL
      )
    `)
    await queryRunner.query(`
      CREATE TABLE "user_assets" (
        "id" SERIAL PRIMARY KEY,
        "quantity" numeric(10,2) NOT NULL DEFAULT 0,
        "userId" integer REFERENCES "user" ("id"),
        "assetId" integer REFERENCES "asset" ("id")
      )
    `)
    await queryRunner.query(`
      CREATE TABLE "transaction" (
        "id" SERIAL PRIMARY KEY,
        "assetId" integer,
        "transactionType" "transaction_transactiontype_enum" NOT NULL,
        "quantity" numeric(10,2) NOT NULL DEFAULT 0,
        "price" numeric NOT NULL,
        "transaction_date" date NOT NULL,
        "user_id" integer REFERENCES "user" ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction"`)
    await queryRunner.query(`DROP TABLE "user_assets"`)
    await queryRunner.query(`DROP TABLE "asset"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TYPE "transaction_transactiontype_enum"`)
  }
}
