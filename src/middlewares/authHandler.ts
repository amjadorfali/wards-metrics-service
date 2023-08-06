import {NextFunction, Request, Response} from "express";
import {cognitoVerifier} from "../libs/aws/auth";

export const authHandler = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            res.status(403).json({error: "Bad auth token"});
            return;
        }

        const payload = await cognitoVerifier.verify(token);

        next();
    } catch (e) {
        res.status(403).json({error: "Bad auth token"});
    }
};
