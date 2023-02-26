import { Controller, Delete, Param, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { AuthGuard } from "src/auth/auth.guard";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";

@Controller("tweet")
export class LikeController {
    constructor(private db: DbService, private firebase: FirebaseService) { }

    @UseGuards(AuthGuard)
    @Post("/:id/like")
    async like(@Param("id") id: string, @Req() req: Request) {
        const user: UserInfo = req["user"]
        return await this.db.like.create({
            data: {
                tweetId: +id,
                userUid: user.uid
            }
        })
    }

    @UseGuards(AuthGuard)
    @Delete("/:id/like")
    async removeLike(@Param("id") id: string, @Req() req: Request) {
        const user: UserInfo = req["user"]
        return await this.db.like.delete({
            where: {
                userUid_tweetId: {
                    tweetId: +id,
                    userUid: user.uid
                }
            }
        })
    }
}