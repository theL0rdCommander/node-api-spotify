require('dotenv').config()
const express = require('express')
const axios = require('axios')
const querystring = require('querystring');
const app = express()
const port = 3000

//reqisitos para obtener autorizacion 
const CLIENT_ID     =process.env.CLIENT_ID
const CLIENT_SECRET =process.env.CLIENT_SECRET
const REDIRECT_URI  =process.env.REDIRECT_URI
const statekey = 'spotify_auth_state'
//let code_verifier = generateRandomString(128);

//#1 inicia requiriendo la autorization
app.get('/auth/login', (req, res) => {
    
    //scope contiene los distintos permisos que requerimos al usuario
    var scope = "streaming \
    user-read-email \
    user-read-private"  
    var state = generateRandomString(16);
 
    //  codeChallenge = generateCodeChallenge(code_verifier);
    //  res.cookie('code_verifier', code_verifier);
    // proximamente se utilizarian, pero el login funciona sin ellas por ahora.

    res.cookie(statekey, state);
    
    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        scope: scope,
        state: state,
        //code_challenge_method: 'S256',    //seguramente sean credenciales que se pidan a futuro
        //code_challenge: codeChallenge
    })

    // peticion de redireccion a la app principal 
    console.log("redirecting to spotify!")
    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

//esta ruta redirecciona desde spotify, una vez el usuario acepta darnos los permisos
app.get('/auth/callback', (req, res) => {
    const code = req.query.code || null;
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
    .then(response => {
        if (response.status === 200) {
    
          const { access_token, token_type } = response.data;
    
          axios.get('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `${token_type} ${access_token}`
            }
          })
            .then(response => {
              res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
            })
            .catch(error => {
              res.send(error);
            });
    
        } else {
          res.send(response);
        }
      })
      .catch(error => {
        res.send(error);
      });
  });

  //Utilizada cuando pasan 3600 segundos, se tiene que autenticar de nuevo, esta vez con un refresh_token
  app.get('/refresh_token', (req, res) => {
    const { refresh_token } = req.query;
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',    //Diferencia al estar logueado
        refresh_token: refresh_token
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        res.send(error);
      });
   });

   
   //Utilizada para generar string random en el intercambio de datos con la api
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

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})