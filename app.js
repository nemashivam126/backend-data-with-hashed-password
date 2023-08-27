const express = require('express')
const connectToDatabase = require('./database/database')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())

connectToDatabase();

app.get('/', (req, res) => {
    res.send("<h1>Hey</h1>")
})

app.post('/register', async(req, res) => {
    try {
        const {name, email, password} = req.body
        if(!(name && email && password)){
            res.status(400).send('All fields are mandatory')
        }
        const existingUser = await User.findOne({ email })
        if(existingUser){
            res.status(401).send('user already exists with this email')
        }   
        const pwdEncrypt = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: pwdEncrypt
        })
        const token = jwt.sign(
            {id: user._id, email} , process.env.ACCESS_TOKEN_SECRET , { expiresIn: '2h'}
        );
        user.token = token
        user.password = undefined

        res.status(201).json(user)

    } catch (error) {
        console.log(error);
    }
})

app.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body
        if(!(email && password)){
            res.status(400).send('Incorrect credential')
        }
        const user = await User.findOne({email})
        if(!(user)){
            res.status(401).send('user does not exist')
        }
        if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign(
                {id: user._id}, process.env.ACCESS_TOKEN_SECRET , { expiresIn: '2h'}
            );
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.status(200).cookie("token", token, options).json({
                success: true,
                token,
                user
            })
        }
    } catch (error) {
        console.log(error);
    }
})

app.get('/dashboard', async(req, res) => {

    try {
        const user = await User.find();
        res.json(user);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = app

app.listen(5000)