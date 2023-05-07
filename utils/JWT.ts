import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import { serviceConstants } from './serviceConstants';
import postgres from './Postgres';

const JWT_SECRET = String(process.env.JWT_SECRET);
// const JWT_REFRESH = String(process.env.JWT_REFRESH);


export const generateToken = (data: any, time?: string) => {
    let expiresIn = time || "1y";
    const accessToken = jwt.sign(data, JWT_SECRET, { expiresIn, algorithm: "HS256" });
    console.log({ accessToken });
    return accessToken;
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.token;
        let userId = req.headers.userid;
        // console.log("headers",req.headers);
        
        if (!token || !userId) return res.status(404).json({ success: false, msg: "userId and token are mandatory" });

        const decoded: any = jwt.verify(String(token), JWT_SECRET);
        if (decoded.user_id != userId) return res.status(404).json({ success: false, msg: "Invalid userId/token" });
        req.headers.userId = decoded.user_id;
        next();
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }
};


export const validateTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await postgres.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title == 'Teacher') return next();
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}

export const validateStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await postgres.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title == 'Student') return next();
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}

export const validateUserType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let username = req.headers.username;
        let userData = (await postgres.GetData(`select title from ${serviceConstants.TABLES.USER} a left join user_roles b on (a.roleId = b.role_id) where email = '${username}'`))[0];
        if (userData && userData.title) {
            req.headers.userType = userData.title
            return next();
        }
        return res.status(401).json({ success: false, msg: "User not authorized" });
    } catch (error: any) {
        console.log(error)
        return res.status(401).json({ success: false, msg: error.message });
    }

}
