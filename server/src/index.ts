/* eslint-disable no-console */
import createApp from './app'
import { createDatabase } from './database'

createDatabase()
  .then(() => {
    const app = createApp()

    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  })
  .catch((error) => console.log(error))
