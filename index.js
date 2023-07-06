require('dotenv').config()
const express = require('express')
const axios = require('axios')
const app = express()
const port = 3000

//reqisitos para obtener autorizacion 
const CLIENT_ID     =process.env.CLIENT_ID
const CLIENT_SECRET =process.env.CLIENT_SECRET
const REDIRECT_URI  =process.env.REDIRECT_URI
const statekey = 'spotify_auth_state'
//let code_verifier = generateRandomString(128);

//#1 inicia requiriendo la authorization
app.get('/auth/login', (req, res) => {
    
    var scope = "streaming \
    user-read-email \
    user-read-private"  
    var state = generateRandomString(16);
    
//  codeChallenge = generateCodeChallenge(code_verifier);
//  res.cookie('code_verifier', code_verifier);

    res.cookie(statekey, state);
    
    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        scope: scope,
        state: state,
        //code_challenge_method: 'S256',
        //code_challenge: codeChallenge
    })
    // peticion de redireccion a la app principal 
    console.log("redirecting to spotify!")
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req,res)=>{
    const code = req.query.code || null;
    var token_query_parameters = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        //client_id: CLIENT_ID,
        //code_verifier: code_verifier
    }).toString();

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: token_query_parameters,
        headers: {
            content_type: 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        }
    }).then(response => {
        if(response.status === 200){
            console.log("acceso al token completado");
            res.send( response.data.toString())
        }else{
            send(response);
        }
    }).catch(error => {
        res.send(error);
    })
    res.send('callback');
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

//Generacion del hash del verifier (codeChallenge)
async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
}  