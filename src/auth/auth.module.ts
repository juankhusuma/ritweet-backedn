import { Module } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { AuthGuard } from "./auth.guard";
import { AuthController } from "./auth.controller";

@Module({
    providers: [FirebaseService, DbService, AuthGuard],
    controllers: [AuthController]
})
export class AuthModule { }