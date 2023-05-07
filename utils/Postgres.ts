import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config()

const pool = new pg.Pool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT)
})

const postgres = {
    GetData(query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            return pool.query(query, [], (err, data) => {
                if (err) return reject(err);
                resolve(data.rows);
            })
        })
    }
    ,
    InsertOrUpdate(query: string, data: any[]) {
        return new Promise((resolve, reject) => {
            return pool.query(query, data, (err, data) => {
                if (err) return reject(err);
                resolve(data.rowCount);
            })
        })
    },

    FetchData(query: string, data: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            return pool.query(query, data, (err, data) => {
                if (err) return reject(err);
                resolve(data.rows);
            })
        })
    }
}

export default postgres