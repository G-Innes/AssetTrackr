/* eslint-disable no-console */
import createApp from './app'
import { createDatabase } from './database'

console.log('Attempting to create database connection...');
createDatabase()
  .then(() => {
    console.log('Database connection established successfully.');
    const app = createApp()

    const port = 3000
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at port: ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error)
    process.exit(1) // Application exits on failure
  })