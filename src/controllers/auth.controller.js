
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")


async function registerUserController(req, res) {
       
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or : [{ username }, { email }]
    })
    
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }
    
    const hash = await becrypt.hash(password, 10)

    const user = await userModel.create({
        username, email, password: hash
    })

}

module.exports = {
    registerUserController
}