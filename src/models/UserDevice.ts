import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "./User";
import {IsNumber, IsString, ValidateNested} from "class-validator";

@Entity('userDevice',{ database: "wsa" })
export class UserDevice extends BaseEntity {

    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @ValidateNested()
    @OneToOne(type => User)
    @JoinColumn()
    user: User;

    @IsNumber()
    @Column()
    userId: number;

    @IsString()
    @Column()
    deviceId: string;

}
