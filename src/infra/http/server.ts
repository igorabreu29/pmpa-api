import { app } from "../app.ts";
import { env } from "../env/index.ts";

app.listen({
  port: env.API_PORT
})  
  .then(() => console.log(`Server running on port ${env.API_PORT}`))