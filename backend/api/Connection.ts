import mysql2 from "mysql2/promise"
import fs from "fs"

export default class Connection {
    private static instance: Connection;
    private dataConnection: any
    private mysqlConnectionPool: any
    private connCount: number = 0
    private file: any;
    private async init() {
        this.mysqlConnectionPool = mysql2.createPool({
            connectionLimit: 1, // Only allow a single connection in the pool
            host: "mysql-26e90521-superpizzaman2004-512a.j.aivencloud.com",
            user: "avnadmin",
            password: "AVNS_22Xvt5U2Ul_KS_o53GX",   //kBKh92TvU76x
            database: "soventory",
            port: 16079
        });
    }

    private constructor() {
        try {
            this.init()
        } catch (error) {
            console.log("unnable to connect to mysql database")
        }
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
        const connection = await this.getConnection() // Get a connection from the pool
        try {
            const result = await connection.query(query) // Perform the query
            connection.release() // Release the connection back to the pool
            this.connCount--;
            return result[0]
        } catch (error) {
            connection.release() // Release the connection back to the pool in case of error
            this.connCount--;
            //await this.__log(String(error))
            return []
            
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
    public async query(query: string): Promise<any> {
        try{
            return await this.__query(this.clean_query(query))
        }
        catch(error){
            console.log(error)
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
