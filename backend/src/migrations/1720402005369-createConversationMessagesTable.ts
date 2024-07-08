import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConversationMessagesTable1720402005369 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "conversation_messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "by" character varying NOT NULL,
                "type" character varying NOT NULL DEFAULT 'text',
                "fileId" uuid,
                "conversationId" uuid NOT NULL,
                "userId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            ADD CONSTRAINT "FK_fileId"
            FOREIGN KEY ("fileId")
            REFERENCES "conversation_file"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            ADD CONSTRAINT "FK_conversationId"
            FOREIGN KEY ("conversationId")
            REFERENCES "conversations"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            ADD CONSTRAINT "FK_userId"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            DROP CONSTRAINT "FK_userId"
        `);

        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            DROP CONSTRAINT "FK_conversationId"
        `);

        await queryRunner.query(`
            ALTER TABLE "conversation_messages"
            DROP CONSTRAINT "FK_fileId"
        `);

        await queryRunner.query(`DROP TABLE "conversation_messages"`);
    }
}
