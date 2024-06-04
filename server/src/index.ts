/* eslint-disable no-console */
import createApp from './app'
import { createDatabase } from './database'

createDatabase()
  .then(() => {
    const app = createApp()

    const port = Number(process.env.PORT) || 3000
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at port: ${port}`)
    })
  })
  .catch((error) => console.log(error))
