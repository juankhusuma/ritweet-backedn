import { Module } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FirebaseService } from "src/firebase/firebase.service";
import { TweetController } from "./tweet.controller";
import { LikeController } from "./like.controller";

@Module({
    providers: [DbService, FirebaseService],
    controllers: [TweetController, LikeController]
})
export class TweetModule { }