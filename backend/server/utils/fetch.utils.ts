import instance from "../Connection"
const Connection = instance.getInstance()
export async function fetchAll(tableName:string){
    var query = await Connection.query(`select * from ${tableName}`)
    return query
}