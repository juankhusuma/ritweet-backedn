import { Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { AuthGuard } from "src/auth/auth.guard";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";

@Controller("tweet")
export class TweetController {
    constructor(private db: DbService, private firebase: FirebaseService) { }

    @UseGuards(AuthGuard)
    @Get("/")
    async getAll(@Req() req: Request) {
        const { uid } = req["user"] as UserInfo;
        const tweets = await this.db.tweet.findMany({
            where: {
                parentId: null,
                author: { OR: [{ uid }, { followedBy: { some: { followerId: uid } } }] },
                OR: [
                    { isPrivate: false },
                    { author: { following: { some: { closeFriend: true, followingId: uid } } } }
                ]
            },
            include: {
                _count: true,
                Like: {
                    select: {
                        userUid: true
                    }
                },
                author: { select: { uid: true } }
            },
            orderBy: {
                createAt: "desc"
            }
        })
        const auth = this.firebase.app.auth()
        return await Promise.all(tweets.map(async tweet => {
            const { author, _count, Like, ...rest } = tweet;
            const user = await auth.getUser(author.uid)
            return ({
                author: {
                    ...user
                },
                ...rest,
                replies: _count.children,
                likes: _count.Like,
                likedBy: Like.map(like => like.userUid)
            })
        }))
    }

    @UseGuards(AuthGuard)
    @Get("/:id")
    async getById(@Param("id") id: string, @Req() req: Request) {
        const { uid } = req["user"] as UserInfo
        const { Like, _count, userUid, children, parent, ...rest } = await this.db.tweet.findFirst({
            where: {
                id: +id,
                OR: [
                    { isPrivate: false },
                    { author: { followedBy: { some: { followingId: uid, closeFriend: true } } } }
                ]
            },
            include: {
                parent: {
                    include: {
                        _count: true,
                        Like: true,
                        author: {
                            select: {
                                uid: true
                            }
                        }
                    }
                },
                children: {
                    select: {
                        id: true,
                        body: true,
                        imageURL: true,
                        userUid: true,
                        _count: true,
                        createAt: true,
                        Like: true
                    },
                    orderBy: { createAt: "desc" }
                },
                _count: true,
                Like: true
            }
        })
        const user = await this.firebase.app.auth().getUser(uid);
        return {
            author: user,
            likedBy: Like.map(like => like.userUid),
            likeCount: _count.Like,
            replyCount: _count.children,
            replies: await Promise.all(children.map(async reply => {
                const { Like, _count, userUid, ...rest } = reply;
                const author = await this.firebase.app.auth().getUser(userUid)
                return {
                    author,
                    likedBy: Like.map(like => like.userUid),
                    likeCount: _count.Like,
                    replyCount: _count.children,
                    ...rest
                }
            })),
            parent: (parent ? {
                createAt: parent.createAt,
                id: parent.id,
                imageURL: parent.imageURL,
                body: parent.body,
                likeCount: parent._count.Like,
                replyCount: parent._count.children,
                likedBy: parent.Like.map(like => like.userUid),
                author: parent.author
            } : null),
            ...rest
        }
    }

    @UseGuards(AuthGuard)
    @Post("/")
    async create(@Req() req: Request, @Body() body: Exclude<Prisma.TweetCreateInput, "author" | "parent">) {
        const { uid } = req["user"] as UserInfo
        const { userUid, _count, Like, ...rest } = await this.db.tweet.create({
            data: {
                author: {
                    connectOrCreate: {
                        where: {
                            uid
                        },
                        create: {
                            uid
                        }
                    }
                },
                ...body
            },
            include: {
                _count: true,
                Like: {
                    select: {
                        userUid: true
                    }
                },
            }
        })
        const user = await this.firebase.app.auth().getUser(userUid)
        return {
            author: user,
            ...rest,
            replies: _count.children,
            likes: _count.Like,
            likedBy: Like.map(like => like.userUid)
        }
    }

    @UseGuards(AuthGuard)
    @Put("/:id")
    async update(@Param("id") id: string, @Req() req: Request, @Body() body: Prisma.TweetUpdateInput) {
        const { uid } = req["user"] as UserInfo
        const tweet = await this.db.tweet.findUnique({ where: { id: +id }, select: { author: { select: { uid: true } } } })
        if (!(tweet.author.uid === uid)) {
            throw new UnauthorizedException()
        }

        return await this.db.tweet.update({
            where: { id: +id },
            data: {
                ...body
            }
        })
    }

    @UseGuards(AuthGuard)
    @Delete("/:id")
    async delete(@Param("id") id: string, @Req() req: Request) {
        const { uid } = req["user"] as UserInfo
        const tweet = await this.db.tweet.findUnique({ where: { id: +id }, select: { author: { select: { uid: true } } } })
        if (!(tweet.author.uid === uid)) {
            throw new UnauthorizedException()
        }
        return await this.db.tweet.delete({
            where: {
                id: +id
            }, select: { id: true }
        })
    }


}