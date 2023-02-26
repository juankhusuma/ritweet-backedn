import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseService } from './firebase/firebase.service';
import { DbService } from './db/db.service';
import { TweetModule } from './tweet/tweet.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, TweetModule, UserModule],
  controllers: [AppController],
  providers: [AppService, FirebaseService, DbService],
})
export class AppModule { }
