export async function handleCors(req:any, res:any, next:any) {
 res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next();
}