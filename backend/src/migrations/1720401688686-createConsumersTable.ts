import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConsumersTable1720401688686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "consumers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying,
                "lastName" character varying,
                "document" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "birthDate" TIMESTAMP,
                "profile" character varying NOT NULL DEFAULT 'consumer',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_document" UNIQUE ("document"),
                CONSTRAINT "UQ_email" UNIQUE ("email"),
                CONSTRAINT "PK_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "consumers"`);
    }
}
