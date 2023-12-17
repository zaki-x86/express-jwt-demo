const express = require("express");
const jwt = require("jsonwebtoken");
require('dotenv').config()

const app = express();
app.use(express.json());


const generate_access_token = (user, expiry='15s') => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: expiry});
}

const generate_refresh_token = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

// Normally, this is stored in DB or redis cache
let refreshTokens = [];

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    else if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        const accessToken = generate_access_token({name: user.name})
        res.json({accessToken: accessToken});
    });


});


app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token );
    res.sendStatus(204);
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const user = {
        name: username,
   };

    const accessToken = generate_access_token(user);
    const refreshToken = generate_refresh_token(user);
    refreshTokens.push(refreshToken);
    res.json({accessToken: accessToken, refreshToken: refreshToken});
});



app.listen(4000);