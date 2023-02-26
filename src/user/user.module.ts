import { Module } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { UserController } from "./user.controller";

@Module({
    providers: [DbService, FirebaseService, AuthGuard],
    controllers: [UserController]
})
export class UserModule { }