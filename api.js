import { once } from "node:events"
import { createServer } from "node:http"
import JWT from 'jsonwebtoken'

const USER_DEFAULT = {
    user: "arth",
    password: "123"
}
const JWT_KEY = 'abc123'




async function loginRoute(req, res) {
    const { user, password } = JSON.parse(await once(req, 'data'))
    if(user !== USER_DEFAULT.user || password !== USER_DEFAULT.password) {
        res.writeHead(401)
        res.end(JSON.stringify({ error: 'usuario invalido' }))
        return;
    }
    const token = JWT.sign({ user, message: 'heey'}, JWT_KEY)
    
    res.end(JSON.stringify({ token }))
}

function isHeaderValid(headers) {
    try {
        const auth = headers.authorization.replace(/bearer\s/ig, '')
        JWT.verify(auth, JWT_KEY)
        return true
    } catch(error) {
        return false
    }
}



async function handler(req, res) {
    if(req.url === '/login' && req.method === 'POST') {
        return loginRoute(req, res)
    }

    if(!isHeaderValid(req.headers)) {
        res.writeHead(400)
        return res.end(JSON.stringify({ error: 'invalid token' }))
    }
    res.end(JSON.stringify({ result: "bem-vindo" }))
}

const app = createServer(handler).listen(8080, () => {
    console.log("rodando http://localhost:8080")
})

export { app }