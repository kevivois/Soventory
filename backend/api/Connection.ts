import mysql2 from "mysql2/promise"

export default class Connection {
    private static instance : Connection;
    private dataConnection : any
    private mysqlConnection : any
    private async init()
    {
        this.mysqlConnection = await mysql2.createConnection({
            host: "localhost",
            user: "root",
            password: "Password",
            database: "soventory",
            port:3306
           });
    }

    private constructor(){
        try
        {
            this.init()
        }
        catch(error)
        {
            console.log("unnable to connect to mysql database")
        }
        
    }
    public static getInstance() {
        return this.instance || (this.instance = new this())
    }
    public setDataConnection(host:string,user:string,password:string,database:string)
    {
        this.dataConnection = {host,user,password,database}

        this.mysqlConnection.destroy()
        this.mysqlConnection = mysql2.createConnection(this.dataConnection)
        try {
            this.mysqlConnection.connect()
            console.log("connected well")
        }
        catch(error)
        {
            console.log("unable to connect to db with error : ",error)
        }
        
    }
    public getConnection() : mysql2.Connection
    {
        return this.mysqlConnection
    }
    public async query(query:string) : Promise<any>
    {
        var result = await this.getConnection().query(query)
        return result[0]
    }
}