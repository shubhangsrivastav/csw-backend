declare namespace Express {

    export interface Request {
        user:{
            username:string,
            iat:number,
            exp:number
        }
    }
  }