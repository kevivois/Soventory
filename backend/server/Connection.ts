import mysql2 from "mysql2/promise"
import fs from "fs"
import { requiredEnv } from "./config"

export default class Connection {
    private static instance: Connection;
    private dataConnection: any
    private mysqlConnectionPool: any
    private connCount: number = 0
    private file: any;
    private init() {
        const port = Number(process.env.DB_PORT || 3306)
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error("DB_PORT must be an integer between 1 and 65535")
        }
        if (process.env.DB_SSL && !["true", "false"].includes(process.env.DB_SSL)) {
            throw new Error("DB_SSL must be true or false")
        }
        this.mysqlConnectionPool = mysql2.createPool({
            connectionLimit: 1, // Only allow a single connection in the pool
            host: requiredEnv("DB_HOST"),
            user: requiredEnv("DB_USER"),
            password: requiredEnv("DB_PASSWORD"),
            database: requiredEnv("DB_NAME"),
            port,
            connectTimeout: 10000,
            ssl: process.env.DB_SSL === "true" ? {
                rejectUnauthorized: true,
                ...(process.env.DB_SSL_CA ? {ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n")} : {})
            } : undefined
        });
    }

    private constructor() {
        this.init()
    }

    public static getInstance() {
        return this.instance || (this.instance = new this())
    }

    public setDataConnection(host: string, user: string, password: string, database: string) {
        this.dataConnection = { host, user, password, database }

        this.mysqlConnectionPool.end(() => {
            // Destroy the connection pool
            this.mysqlConnectionPool = mysql2.createPool(this.dataConnection) // Create a new connection pool with the updated dataConnection
        });
    }

    public async getConnection(): Promise<mysql2.PoolConnection> {
        return this.mysqlConnectionPool.getConnection() // Get a connection from the pool
    }

    private async __query(query: string): Promise<any> {
        await this.wait();
        this.connCount++;
        let connection: mysql2.PoolConnection | undefined
        try {
            connection = await this.getConnection()
            const result = await connection.query({ sql: query, timeout: 15000 })
            return result[0]
        } finally {
            connection?.release()
            this.connCount--;
        }
        
    }
    private async __log(text:string){ // TODO REMOVE THIS FUNCTION IN PRODUCTION
        // show date like hh:mm:ss:zzz
        const date = new Date();
        const time = date.toISOString();
        text = `${time} : ${text} \n`
        this.file = fs.createWriteStream("log.txt", {flags:'a'});
        this.file.write(text);
        this.file.end();
    }
    private clean_query(query:string):string{
        let new_query = query.replace(/"/g, "'");
        return new_query
    }
    public async query(query: string, throwOnError = false): Promise<any> {
        try{
            return await this.__query(this.clean_query(query))
        }
        catch(error){
            console.log(error)
            if (throwOnError) throw error
            return []
        }
    }
    public async wait() {
        if(this.connCount <= 0) return 0;
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.connCount <= 0) {
                    clearInterval(interval);
                    resolve(0);
                }
            }, 5);
        });
    }
}
