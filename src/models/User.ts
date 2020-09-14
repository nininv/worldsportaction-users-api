import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm-plus";
import {IsBoolean, IsDate, IsNumber, IsString, IsObject} from "class-validator";

@Entity()
export class User extends BaseEntity {

    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Column()
    firstName: string;

    @IsString()
    @Column({ nullable: true, default: null })
    middleName: string;

    @IsString()
    @Column()
    lastName: string;

    @IsString()
    @Column()
    mobileNumber: string;

    @IsString()
    @Column()
    email: string;

    @IsString()
    @Column({select: false})
    password: string;

    @IsDate()
    @Column()
    dateOfBirth: Date;

    @IsNumber()
    @Column()
    genderRefId: number;

    @IsNumber()
    @Column()
    statusRefId: number;

    @IsString()
    @Column({select: false})
    reset: string;

    @IsBoolean()
    @Column()
    marketingOptIn: boolean;

    @IsString()
    @Column()
    photoUrl: string;

    @IsString()
    @Column()
    firebaseUID: string;

    @IsString()
    @Column()
    street1: string;

    @IsString()
    @Column()
    street2: string;

    @IsString()
    @Column()
    suburb: string;

    @IsNumber()
    @Column()
    stateRefId: number;

    @IsString()
    @Column()
    emergencyContactName: string;

    @IsString()
    @Column()
    emergencyContactNumber: string;

    @IsString()
    @Column()
    postalCode: string;

    @IsDate()
    @Column()
    childrenCheckExpiryDate: Date;

    @IsString()
    @Column()
    childrenCheckNumber: string;

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

    @IsBoolean()
    @Column({ default: false })
    tfaEnabled: boolean;

    @IsString()
    @Column({ nullable: true, default: null, select: false })
    tfaSecret: string;

    @IsString()
    @Column({ nullable: true, default: null, select: false })
    tfaSecretUrl: string;
}
