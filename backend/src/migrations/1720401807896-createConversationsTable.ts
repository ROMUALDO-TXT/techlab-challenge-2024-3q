import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConversationsTable1720401807896 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE "conversations" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "subject" character varying NOT NULL,
                    "consumerId" uuid NOT NULL,
                    "userId" uuid,
                    "status" character varying NOT NULL DEFAULT 'pending',
                    "rate" integer,
                    "closingReason" character varying,
                    "startedAt" TIMESTAMP,
                    "finishedAt" TIMESTAMP,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "deletedAt" TIMESTAMP,
                    CONSTRAINT "PK_id" PRIMARY KEY ("id")
                )
            `);

        await queryRunner.query(`
                ALTER TABLE "conversations" 
                ADD CONSTRAINT "FK_consumerId" 
                FOREIGN KEY ("consumerId") 
                REFERENCES "consumers"("id") 
                ON DELETE NO ACTION 
                ON UPDATE NO ACTION
            `);

        await queryRunner.query(`
                ALTER TABLE "conversations" 
                ADD CONSTRAINT "FK_userId" 
                FOREIGN KEY ("userId") 
                REFERENCES "users"("id") 
                ON DELETE NO ACTION 
                ON UPDATE NO ACTION
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "conversations" 
                DROP CONSTRAINT "FK_userId"
            `);

        await queryRunner.query(`
                ALTER TABLE "conversations" 
                DROP CONSTRAINT "FK_consumerId"
            `);

        await queryRunner.query(`DROP TABLE "conversations"`);
    }
}
