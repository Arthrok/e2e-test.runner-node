import { describe, before, after, it } from "node:test"
import assert from 'node:assert'
const BASE_URL = 'http://localhost:8080'

describe("API Workflow", () => {
    let _server = {} 
    let _globalToken = ''
    before(async () => {
        _server = (await import('./api.js')).app
        await new Promise(resolve => _server.once('listening', resolve))
    })

    after(done => _server.close(done))


    it('deve receber um status de não autorizado quando senhar ou user estiver errado', async () => {
        const data = {
            user: "arth",
            password: ''
        }
        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        assert.strictEqual(request.status, 401)
        const response = await request.json()
        assert.deepStrictEqual(response, { error: 'usuario invalido' })
    })

    
    it('deve ter sucesso no login quando user e pass. certos', async () => {
        const data = {
            user: "arth",
            password: '123'
        }
        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        assert.strictEqual(request.status, 200)
        const response = await request.json()
        assert.ok(response.token, 'token foi criado')
        _globalToken = response.token
    })


    it('nao deve acessar um dado privado sem token válido', async () => {
        const request = await fetch(`${BASE_URL}/`, {
            method: 'GET',
            headers: {
                authorization: ''
            }
        })
        assert.strictEqual(request.status, 400)
        const response = await request.json()
        assert.deepStrictEqual(response, { error: 'invalid token' })
    })


    it('deve acessar um dado privado token válido', async () => {
        const request = await fetch(`${BASE_URL}/`, {
            method: 'GET',
            headers: {
                authorization: _globalToken
            }
        })
        assert.strictEqual(request.status, 200)
        const response = await request.json()
        assert.deepStrictEqual(response, { result: "bem-vindo" })
    })


})