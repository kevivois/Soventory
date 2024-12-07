export async function handleCors(req:any, res:any, next:any) {
  console.log(req,res);
 res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next();
}