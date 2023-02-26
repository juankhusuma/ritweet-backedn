import { Injectable } from "@nestjs/common";
import firebase from "firebase-admin";
import serviceAccountConfig from "ristek-tweet-firebase-adminsdk-6ar2u-3d5e8f3c66.json"

@Injectable()
export class FirebaseService {
    app!: firebase.app.App;
    constructor() {
        if (firebase.apps.length === 0) {
            this.app = firebase.initializeApp({
                credential: firebase.credential.cert({
                    clientEmail: serviceAccountConfig.client_email,
                    privateKey: serviceAccountConfig.private_key,
                    projectId: serviceAccountConfig.project_id
                })
            })
        } else {
            this.app = firebase.apps[0]
        }
    }
}