import { hash } from "bcryptjs";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertSudoUser1720403667205 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const username = 'root';
        const email = 'root@root.com';
        const password = 'root';
        const hashedPassword = await hash(password, 8);
        const available = true;
        const profile = 'sudo';
        const createdAt = new Date();
        const updatedAt = new Date();

        await queryRunner.query(`
                INSERT INTO "users" ("username", "email", "password", "available", "profile", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [username, email, hashedPassword, available, profile, createdAt, updatedAt]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                DELETE FROM "users" WHERE "username" = 'root'
            `);
    }
}
