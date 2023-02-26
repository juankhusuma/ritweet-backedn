import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { FirebaseService } from "src/firebase/firebase.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private firebase: FirebaseService) { }
    async canActivate(ctx: ExecutionContext) {
        const request: Request = ctx.switchToHttp().getRequest()
        const token = request.headers.authorization
        if (!token) return false
        try {
            console.log(token)
            const user = await this.firebase.app
                .auth()
                .verifyIdToken(token.replace("Bearer ", ""))
            request["user"] = user;
            return true
        } catch (err) {
            console.log(err);
            return false

        }
    }
}