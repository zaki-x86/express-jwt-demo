const express = require("express");
const jwt = require("jsonwebtoken");
require('dotenv').config()

const app = express();
app.use(express.json());

const tempData = [
    {username: 'Zaki', title:'post1'}, {username: 'Ahmed', title:'post2'}
];

app.get("/posts", authenticateToken, (req, res) => {
    let post = tempData.filter(post => post.username === req.user.name);
    res.json(post);
});


// Authentication middleware
function authenticateToken (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.listen(3000);