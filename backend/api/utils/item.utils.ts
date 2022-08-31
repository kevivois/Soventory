import instance from "../Connection"
const Connection = instance.getInstance()

export async function getRightOfUser(id:number)
{
  var result = await Connection.query(`Select droit.name as name from utilisateur inner join droit on droit.id = droit_FK where utilisateur.id=${id}`)
  return result[0].name || null
}