import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {IsNumber, IsString} from "class-validator";

@Entity()
export class Club extends BaseEntity {

    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Column()
    name: string;

    @IsString()
    @Column()
    logoUrl: string;

    @IsNumber()
    @Column()
    competitionId: number;
}



