import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "./auth.guard";
import { DbService } from "src/db/db.service";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

@Controller("auth")
export class AuthController {
    constructor(private db: DbService) { }

    @UseGuards(AuthGuard)
    @Post("/register")
    async register(@Req() req: Request) {
        const payload: DecodedIdToken = req["user"]
        const user = await this.db.user.findUnique({
            where: {
                uid: payload.uid
            }
        })
        return user ? user :
            await this.db.user.create({
                data: {
                    uid: payload.uid
                }
            })
    }
}
