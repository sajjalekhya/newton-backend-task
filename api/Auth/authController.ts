import { Request, Response } from "express";
import { generateToken } from "../../utils/JWT";
import postgres from "../../utils/Postgres";
import { serviceConstants } from "../../utils/serviceConstants";


export const signIn = async (req: Request, res: Response) => {
    try {
        const userName = req.body.userName;
        const password = req.body.password;
        const mailId = req.body.mailId;
        const creationDate = new Date().toISOString();
        console.log('Inside', req.body, `select * from ${serviceConstants.TABLES.USER} where mail_id = '${mailId}'`)
        var userData: any = (await postgres.GetData(`select * from ${serviceConstants.TABLES.USER} where mail_id = '${mailId}'`))[0];
        let status: any;

        if(userData){
            return res.status(401).json({ success:false, info: 'User already registered with this emailId' })
        }else{
            //By Default if account does not exit (user will be created under normal users)
            const roleId = 2;
            status = await postgres.InsertOrUpdate(`insert into ${serviceConstants.TABLES.USER} (name, creation_date, mail_id, password, role_id) values($1,$2,$3,$4,$5)`, [userName, creationDate, mailId, password, roleId]);
        }

        if (status == 1) {
            return res.json({ success:true, info: 'User created successfully' })
        }
        return res.status(401).json({ success:false, info: 'Something went wrong...Please try again after sometime' })
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }

}

export const logIn = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const mailId = req.body.mailId;
        console.log('Inside', req.body, `select * from ${serviceConstants.TABLES.USER} where mail_id = '${mailId}' and password = '${password}'`)
        var userData: any = (await postgres.GetData(`select * from ${serviceConstants.TABLES.USER} where mail_id = '${mailId}' and password = '${password}'`))[0];

        if(userData){
            var token = generateToken(userData)
            return res.json({ success: true, userId: userData.user_id, token})
        }
        return res.status(401).json({ success:false, info: 'Something went wrong...Please try again after sometime' })
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }

}