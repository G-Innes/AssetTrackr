import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Moves from "a stored holdings table plus a transaction log" to "the
 * transaction ledger is the only source of truth":
 *
 *  - assets are identified by their ticker instead of a number the browser sent
 *  - every transaction references a real asset row and a real user
 *  - quantities and prices become numeric(36,18); the old numeric(10,2)
 *    rounded 0.004 BTC down to 0.00
 *  - `user_assets` is dropped; where it disagreed with the ledger (holdings
 *    could be deleted without a transaction) a balancing transaction is added
 *    so nobody's visible balance changes
 *  - usernames and emails become unique regardless of letter case
 */
export class TransactionLedger1763000000000 implements MigrationInterface {
  name = 'TransactionLedger1763000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- users ------------------------------------------------------------
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now()
    `)
    // Login has always been case-insensitive while the unique constraints
    // were not. Keep the oldest account's name and suffix later clashes.
    await queryRunner.query(`
      UPDATE "user" u SET "username" = u."username" || '_' || u."id"
      WHERE EXISTS (
        SELECT 1 FROM "user" o
        WHERE lower(o."username") = lower(u."username") AND o."id" < u."id"
      )
    `)
    await queryRunner.query(`
      UPDATE "user" u SET "email" = lower(u."email")
      WHERE u."email" <> lower(u."email") AND NOT EXISTS (
        SELECT 1 FROM "user" o
        WHERE o."id" <> u."id" AND lower(o."email") = lower(u."email")
      )
    `)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_username_lower" ON "user" (lower("username"))
    `)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_email_lower" ON "user" (lower("email"))
    `)

    // --- assets -----------------------------------------------------------
    await queryRunner.query(
      `UPDATE "asset" SET "ticker" = upper(trim("ticker"))`
    )

    // --- transactions -----------------------------------------------------
    await queryRunner.query(`
      ALTER TABLE "transaction"
        ADD COLUMN "asset_id" integer,
        ADD COLUMN "note" text,
        ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now(),
        ALTER COLUMN "quantity" DROP DEFAULT,
        ALTER COLUMN "quantity" TYPE numeric(36,18),
        ALTER COLUMN "price" TYPE numeric(36,18)
    `)
    await queryRunner.query(`
      ALTER TABLE "transaction"
        ALTER COLUMN "transaction_date" TYPE timestamptz
        USING "transaction_date"::timestamp AT TIME ZONE 'UTC'
    `)
    await queryRunner.query(`
      ALTER TABLE "transaction" RENAME COLUMN "transaction_date" TO "executed_at"
    `)
    await queryRunner.query(`
      ALTER TABLE "transaction" RENAME COLUMN "transactionType" TO "type"
    `)
    await queryRunner.query(`
      ALTER TYPE "transaction_transactiontype_enum" RENAME TO "transaction_type"
    `)

    // Old rows only carried the browser-supplied catalogue number. Resolve it
    // to the asset row that number created.
    await queryRunner.query(`
      UPDATE "transaction" t SET "asset_id" = a."id"
      FROM (
        SELECT "assetId" AS catalogue_id, min("id") AS id
        FROM "asset" GROUP BY "assetId"
      ) a
      WHERE a.catalogue_id IS NOT DISTINCT FROM t."assetId"
    `)

    // Two asset rows can share a ticker (same coin entered twice). Fold them
    // into the oldest row before the ticker becomes unique.
    await queryRunner.query(`
      CREATE TEMPORARY TABLE asset_merge ON COMMIT DROP AS
      SELECT a."id" AS old_id, k.keep_id
      FROM "asset" a
      JOIN (
        SELECT "ticker", min("id") AS keep_id FROM "asset" GROUP BY "ticker"
      ) k ON k."ticker" = a."ticker"
      WHERE a."id" <> k.keep_id
    `)
    await queryRunner.query(`
      UPDATE "transaction" t SET "asset_id" = m.keep_id
      FROM asset_merge m WHERE t."asset_id" = m.old_id
    `)
    await queryRunner.query(`
      UPDATE "user_assets" ua SET "assetId" = m.keep_id
      FROM asset_merge m WHERE ua."assetId" = m.old_id
    `)

    // Rows that cannot be shown to anyone: no owner, no resolvable asset, or
    // a quantity the old column rounded down to zero.
    await queryRunner.query(`
      DELETE FROM "transaction"
      WHERE "user_id" IS NULL OR "asset_id" IS NULL OR "quantity" <= 0
    `)

    // Reconcile the ledger with the balances users could actually see.
    await queryRunner.query(`
      INSERT INTO "transaction"
        ("user_id", "asset_id", "type", "quantity", "price", "executed_at", "note")
      SELECT
        b.user_id,
        b.asset_id,
        (CASE WHEN b.diff > 0 THEN 'buy' ELSE 'sell' END)::"transaction_type",
        abs(b.diff),
        GREATEST(a."current_price", 0),
        now(),
        'Balance adjustment (data migration)'
      FROM (
        SELECT
          COALESCE(h.user_id, l.user_id) AS user_id,
          COALESCE(h.asset_id, l.asset_id) AS asset_id,
          COALESCE(h.quantity, 0) - COALESCE(l.quantity, 0) AS diff
        FROM (
          SELECT "userId" AS user_id, "assetId" AS asset_id, sum("quantity") AS quantity
          FROM "user_assets"
          WHERE "userId" IS NOT NULL AND "assetId" IS NOT NULL
          GROUP BY "userId", "assetId"
        ) h
        FULL OUTER JOIN (
          SELECT
            "user_id",
            "asset_id",
            sum(CASE WHEN "type" = 'buy' THEN "quantity" ELSE -"quantity" END) AS quantity
          FROM "transaction"
          GROUP BY "user_id", "asset_id"
        ) l ON l.user_id = h.user_id AND l.asset_id = h.asset_id
      ) b
      JOIN "asset" a ON a."id" = b.asset_id
      WHERE b.diff <> 0
    `)

    await queryRunner.query(`DROP TABLE "user_assets"`)
    await queryRunner.query(`
      DELETE FROM "asset" a USING asset_merge m WHERE a."id" = m.old_id
    `)
    await queryRunner.query(`
      ALTER TABLE "asset"
        DROP COLUMN "assetId",
        DROP COLUMN "current_price",
        ADD CONSTRAINT "UQ_asset_ticker" UNIQUE ("ticker")
    `)

    await queryRunner.query(`
      ALTER TABLE "transaction" DROP CONSTRAINT IF EXISTS "FK_b4a3d92d5dde30f3ab5c34c5862"
    `)
    await queryRunner.query(`
      ALTER TABLE "transaction" DROP CONSTRAINT IF EXISTS "transaction_user_id_fkey"
    `)
    await queryRunner.query(`
      ALTER TABLE "transaction"
        DROP COLUMN "assetId",
        ALTER COLUMN "user_id" SET NOT NULL,
        ALTER COLUMN "asset_id" SET NOT NULL,
        ADD CONSTRAINT "FK_transaction_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_transaction_asset" FOREIGN KEY ("asset_id")
          REFERENCES "asset" ("id") ON DELETE RESTRICT,
        ADD CONSTRAINT "CHK_transaction_quantity_positive" CHECK ("quantity" > 0),
        ADD CONSTRAINT "CHK_transaction_price_not_negative" CHECK ("price" >= 0)
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_user_asset" ON "transaction" ("user_id", "asset_id")
    `)
  }

  public async down(): Promise<void> {
    // The old schema stored less information (two decimal places, no asset
    // reference), so there is no faithful way back. Restore from a backup.
    throw new Error('TransactionLedger1763000000000 cannot be reverted')
  }
}
