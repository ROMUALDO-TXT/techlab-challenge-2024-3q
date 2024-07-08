import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1720401712268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "username" character varying NOT NULL,
                    "email" character varying NOT NULL,
                    "password" character varying NOT NULL,
                    "available" boolean NOT NULL,
                    "profile" character varying NOT NULL DEFAULT 'standard',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "deletedAt" TIMESTAMP,
                    CONSTRAINT "UQ_username" UNIQUE ("username"),
                    CONSTRAINT "UQ_email" UNIQUE ("email"),
                    CONSTRAINT "PK_id" PRIMARY KEY ("id")
                )
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
