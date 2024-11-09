const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const bcrypt = require('bcrypt')

const dbPath = path.join(__dirname, 'userData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
app.use(express.json()) // Ensure JSON parsing middleware is used

app.post('/register', async function (request, response) {
  let {username, name, password, gender, location} = request.body
  let hashedPassword = await bcrypt.hash(password, 10)
  let checkUser = `SELECT * FROM user WHERE username= '${username}';`
  let checkert = await db.get(checkUser)
  if (checkert === undefined) {
    let lengthOfPassword = password.length
    if (lengthOfPassword > 4) {
      let insertValue = `INSERT INTO user(username,name,password,gender,location)
    VALUES(
        '${username}','${name}','${hashedPassword}','${gender}','${location}');`
      let insertValuet = await db.run(insertValue)
      response.status(200)
      response.send('User Created Successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

app.post('/login', async function (request, response) {
  let {username, password} = request.body
  let query = `SELECT * FROM user WHERE username='${username}';`
  let queryt = await db.get(query)
  if (queryt !== undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    let passwordCheck = await bcrypt.compare(oldPassword, queryt.password)
    if (passwordCheck === true) {
      response.status(200)
      response.send('Login Success')
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})

app.put('/change-password', async function (request, response) {
  let {username, oldPassword, newPassword} = request.body
  let query = `SELECT * FROM user WHERE username='${username}';`
  let queryt = await db.get(query)
  if (queryt === true) {
    let passwordCheck = await bcrypt.compare(oldPassword, userData.db)
    if (passwordCheck === true) {
      let newPasswordLength = newPassword.length
      if (newPasswordLength > 4) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        let finalquery = `UPDATE user 
                SET password='${hashedNewPassword}'
                WHERE username=${username};`
        let finalsentquery = await db.run(finalquery)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid Current Password')
    }
  }
})
