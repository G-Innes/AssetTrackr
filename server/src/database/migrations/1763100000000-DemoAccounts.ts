import { MigrationInterface, QueryRunner } from 'typeorm'

/** Marks throwaway accounts created by "Try the demo" so they can be purged. */
export class DemoAccounts1763100000000 implements MigrationInterface {
  name = 'DemoAccounts1763100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN "is_demo" boolean NOT NULL DEFAULT false
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_user_demo_created" ON "user" ("created_at") WHERE "is_demo"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_user_demo_created"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_demo"`)
  }
}
