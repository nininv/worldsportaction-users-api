import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm-plus';
import { IsNumber, IsDate } from 'class-validator';

@Entity('affiliate')
export class Affiliate extends BaseEntity {
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @IsNumber()
  @Column()
  organisationTypeRefId: number;

  @IsNumber()
  @Column()
  affiliatedToOrgId: number;

  @IsNumber()
  @Column()
  affiliateOrgId: number;

  @IsNumber()
  @Column()
  parentOrgId: number;

  @IsNumber()
  @Column()
  statusRefId: number;

  @IsNumber()
  @Column()
  createdBy: number;

  @IsNumber()
  @Column({ nullable: true, default: null })
  updatedBy: number;

  @IsDate()
  @Column({ nullable: true, default: null })
  updatedOn: Date;

  @IsNumber()
  @Column({ default: 0 })
  isDeleted: number;
}
