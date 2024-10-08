import { app } from "../app.ts";
import { env } from "../env/index.ts";

app.listen({
  host: '0.0.0.0',
  port: env.API_PORT 
})  
  .then(() => console.log(`Server running on port ${env.API_PORT}`))