import {ViewColumn, ViewEntity} from "typeorm";
import {IsNumber, IsString} from "class-validator";

@ViewEntity('linked_entities')
export class LinkedEntities {

    @IsNumber()
    @ViewColumn()
    inputEntityId: number;

    @IsNumber()
    @ViewColumn()
    inputEntityTypeId: number;

    @IsNumber()
    @ViewColumn()
    linkedEntityId: number;

    @IsNumber()
    @ViewColumn()
    linkedEntityTypeId: number;

    @IsString()
    @ViewColumn()
    linkedEntityName: string;
}
