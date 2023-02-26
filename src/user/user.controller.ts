import { Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { AuthGuard } from "src/auth/auth.guard";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";

@Controller("user")
export class UserController {
    constructor(private db: DbService, private firebase: FirebaseService) { }

    @UseGuards(AuthGuard)
    @Get("/")
    async getALl(@Req() req: Request) {
        const user = req["user"] as UserInfo
        return await Promise.all((await this.db.user.findMany())
            .filter(usr => usr.uid != user.uid)
            .map(async usr => await this.firebase.app.auth().getUser(usr.uid)))
    }

    @UseGuards(AuthGuard)
    @Get("/following")
    async getFollowing(@Req() req: Request) {
        const user = req["user"] as UserInfo
        return (await this.db.follows.findMany({
            where: {
                followerId: user.uid
            }
        })).map(fol => fol.followingId)
    }

    @UseGuards(AuthGuard)
    @Get("/follower")
    async getFollower(@Req() req: Request) {
        const user = req["user"] as UserInfo
        return (await this.db.follows.findMany({
            where: {
                followingId: user.uid
            }
        })).map(fol => fol.followerId)
    }

    @UseGuards(AuthGuard)
    @Delete("/follower/:id")
    async removeFollower(@Req() req: Request, @Param("id") id: string) {
        const user = req["user"] as UserInfo
        return await this.db.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: id,
                    followingId: user.uid
                }
            }
        })
    }

    @UseGuards(AuthGuard)
    @Post("/follow/:id")
    async follow(@Req() req: Request, @Param("id") id: string) {
        const user = req["user"] as UserInfo
        return await this.db.follows.create({
            data: {
                followerId: user.uid,
                followingId: id
            }
        })
    }

    @UseGuards(AuthGuard)
    @Delete("/follow/:id")
    async unfollow(@Req() req: Request, @Param("id") id: string) {
        const user = req["user"] as UserInfo
        return await this.db.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: user.uid,
                    followingId: id
                }
            }
        })
    }

    @UseGuards(AuthGuard)
    @Post("/add-friend/:id")
    async befriend(@Req() req: Request, @Param("id") id: string) {
        const user = req["user"] as UserInfo
        return await this.db.follows.update({
            where: {
                followerId_followingId: {
                    followerId: user.uid,
                    followingId: id
                },
            },
            data: {
                closeFriend: true
            }
        })
    }

    @UseGuards(AuthGuard)
    @Delete("/add-friend/:id")
    async unfriend(@Req() req: Request, @Param("id") id: string) {
        const user = req["user"] as UserInfo
        return await this.db.follows.update({
            where: {
                followerId_followingId: {
                    followerId: user.uid,
                    followingId: id
                },
            },
            data: {
                closeFriend: false
            }
        })
    }

    @UseGuards(AuthGuard)
    @Get("/friend")
    async getFriend(@Req() req: Request) {
        const user = req["user"] as UserInfo
        return (await this.db.follows.findMany({
            where: {
                followerId: user.uid,
                closeFriend: true
            }
        })).map(friend => friend.followingId)
    }
}