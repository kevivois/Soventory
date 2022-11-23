import getIp from "../../IP";
export async function handleCors(req:any, res:any, next:any) {
  
  if(req.header("Origin") == "http://localhost:3000" || req.header("Origin") == "http://"+getIp()+":3000"){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
  }
  else{
    res.header("Access-Control-Allow-Origin","http://localhost:3000");
  }
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers","Origin","X-Requested-With, Content-Type, Accept");
  next();
}