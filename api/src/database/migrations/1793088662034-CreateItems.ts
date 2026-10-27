import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItems1793088662034 implements MigrationInterface {
  name = 'CreateItems1793088662034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`items\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` varchar(500) NULL, \`category\` enum ('ELECTRONICS', 'WALLET', 'BAG', 'CLOTHING', 'KEYS', 'DOCUMENTS', 'OTHER') NOT NULL, \`locationFound\` varchar(100) NOT NULL, \`foundAt\` datetime NOT NULL, \`status\` enum ('UNCLAIMED', 'CLAIMED', 'RETURNED') NOT NULL DEFAULT 'UNCLAIMED', \`ownerName\` varchar(100) NULL, \`ownerContact\` varchar(100) NULL, \`claimedAt\` datetime NULL, \`returnedAt\` datetime NULL, \`loggedById\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_27cd73184579fdb8a84c3a4ed8\` (\`foundAt\`), INDEX \`IDX_36275759f2cbc3b5ca32f39341\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`items\` ADD CONSTRAINT \`FK_f4f8978ad62a806f500d2fc0217\` FOREIGN KEY (\`loggedById\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_f4f8978ad62a806f500d2fc0217\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_36275759f2cbc3b5ca32f39341\` ON \`items\``);
    await queryRunner.query(`DROP INDEX \`IDX_27cd73184579fdb8a84c3a4ed8\` ON \`items\``);
    await queryRunner.query(`DROP TABLE \`items\``);
  }
}
