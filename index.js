require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

const CLIENT_ID     =process.env.CLIENT_ID
const CLIENT_SECRET =process.env.CLIENT_SECRET
const REDIRECT_URI  =process.env.REDIRECT_URI

app.get('/auth/login', (req, res) => {
    
    console.log("redirecting to spotify")
    var scope = "streaming \
                 user-read-email \
                 user-read-private"  
    var state = generateRandomString(16);
  
    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID
//        scope: scope,
//        state: state
    })
    // peticion de redireccion a la app principal 
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})
  
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };