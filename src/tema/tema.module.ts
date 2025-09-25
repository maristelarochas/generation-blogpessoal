import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tema } from "./entities/tema.entity";
import { TemaController } from "src/postagem/controllers/tema.controller";
import { TemaService } from "src/services/tema.service";

@Module({
    imports: [TypeOrmModule.forFeature([Tema])],
    providers: [TemaService],
    controllers: [TemaController],
    exports: [TemaService],
})

export class TemaModule {}