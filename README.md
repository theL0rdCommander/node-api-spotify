# node-api-spotify
SOBRE LAS VARIABLES DE ENTORNO:
La idea es generar un archivo .env de forma local al repositorio y que no sea tenido en cuenta por GIT, para no exponer 
las diferentes claves que hay allí*, por ejemplo CLIENT_SECRET:

---.env
CLIENT_ID="a69451caa41624673"          
CLIENT_SECRET="a69451caa41624673"
REDIRECT_URI="http://localhost:3000/auth/callback"
----
La aplicacion consume estos archivos a traves de la biblioteca dotenv.

*Para esto sirve agregar ciertas caracteristicas al archivo .gitignore (ver archivo)

El uso de github_secrets puede ser una opcion cuando se pase a realizar la build del proyecto, por ahora se puede n manejar de forma local

