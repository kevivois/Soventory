const assert = require("node:assert/strict")
const { generateKeyPairSync } = require("node:crypto")
const { once } = require("node:events")
const { existsSync } = require("node:fs")
const { join } = require("node:path")
const { after, before, test } = require("node:test")

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 })
process.env.JWT_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString()
process.env.DB_HOST = "127.0.0.1"
process.env.DB_USER = "test"
process.env.DB_PASSWORD = "test"
process.env.DB_NAME = "soventory_test"
process.env.DB_PORT = "3306"
process.env.DB_SSL = "false"
process.env.CORS_ORIGINS = "https://inventory.example.com, http://localhost:3000"

const app = require("../index").default
const Connection = require("../server/Connection").default
const { signJWT, verifyJWT } = require("../server/utils/token.utils")
const { requiredEnv } = require("../server/config")
const bcrypt = require("bcrypt")
let server
let baseUrl

before(async () => {
    server = app.listen(0, "127.0.0.1")
    await once(server, "listening")
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
})

test("the Vercel entry exports an Express application", () => {
    assert.equal(typeof app, "function")
    assert.equal(typeof app.listen, "function")
})

test("internal modules are outside Vercel's reserved api directory", () => {
    assert.equal(existsSync(join(__dirname, "..", "api")), false)
})

test("CORS accepts the configured frontend and credentials", async () => {
    const response = await fetch(`${baseUrl}/user/login`, {
        method: "OPTIONS",
        headers: {
            Origin: "https://inventory.example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    })
    assert.equal(response.status, 204)
    assert.equal(response.headers.get("access-control-allow-origin"), "https://inventory.example.com")
    assert.equal(response.headers.get("access-control-allow-credentials"), "true")
    assert.match(response.headers.get("access-control-allow-headers"), /content-type/i)
})

test("CORS does not authorize an unconfigured origin", async () => {
    const response = await fetch(`${baseUrl}/user/tryLogin`, {
        headers: { Origin: "https://other.example.com" }
    })
    assert.equal(response.headers.get("access-control-allow-origin"), null)
})

test("protected routes still reject unauthenticated requests", async () => {
    const response = await fetch(`${baseUrl}/user/tryLogin`)
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { error: "Forbidden" })
})

test("login rejects missing credentials without accessing MySQL", async () => {
    const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: "Missing parameters" })
})

test("bcrypt verifies existing hashes and JWTs round-trip on Node 22", async () => {
    const hash = await bcrypt.hash("test-password", 4)
    assert.equal(await bcrypt.compare("test-password", hash.replace(/^\$2b\$/, "$2a$")), true)
    assert.equal(await bcrypt.compare("wrong-password", hash), false)
    const token = signJWT({ id: 1, droit: "LIRE" }, "30m")
    assert.equal(verifyJWT(token).user.id, 1)
    assert.equal(verifyJWT(token).expired, false)
    assert.equal(verifyJWT(signJWT({ id: 1 }, -1)).expired, true)
    assert.equal(verifyJWT(`${token}invalid`).user, null)
})

test("login issues host-only cookies and logout clears them", async () => {
    const connection = Connection.getInstance()
    const originalQuery = connection.query
    const hash = await bcrypt.hash("test-password", 4)
    connection.query = async query => {
        if (query.startsWith("select * from utilisateur")) {
            return [{ id: 1, nom_utilisateur: "test", mot_de_passe: hash }]
        }
        if (query.startsWith("select * from refreshtoken")) {
            return []
        }
        if (query.toLowerCase().includes("inner join droit")) {
            return [{ name: "LIRE" }]
        }
        return { insertId: 1 }
    }
    try {
        const response = await fetch(`${baseUrl}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom_utilisateur: "test", mot_de_passe: "test-password" })
        })
        assert.equal(response.status, 200)
        const cookies = response.headers.getSetCookie()
        assert.equal(cookies.length, 2)
        for (const cookie of cookies) {
            assert.match(cookie, /HttpOnly/)
            assert.match(cookie, /Secure/)
            assert.match(cookie, /SameSite=None/)
            assert.doesNotMatch(cookie, /Domain=/i)
        }
        const cookieHeader = cookies.map(cookie => cookie.split(";")[0]).join("; ")
        const logout = await fetch(`${baseUrl}/user/logout`, {
            method: "POST",
            headers: { Cookie: cookieHeader }
        })
        assert.equal(logout.status, 200)
        for (const cookie of logout.headers.getSetCookie()) {
            assert.doesNotMatch(cookie, /Domain=/i)
            assert.match(cookie, /Expires=Thu, 01 Jan 1970/)
        }
    } finally {
        connection.query = originalQuery
    }
})

test("missing production configuration fails explicitly", () => {
    assert.throws(() => requiredEnv("SOVENTORY_MISSING_TEST_VARIABLE"), /Missing environment variable/)
})

test("strict database queries propagate failures and release the query counter", async () => {
    const connection = Connection.getInstance()
    const originalGetConnection = connection.getConnection
    const failure = new Error("Simulated database connection failure")
    connection.getConnection = async () => { throw failure }
    try {
        await assert.rejects(connection.query("SELECT 1", true), error => error === failure)
        assert.equal(connection.connCount, 0)
    } finally {
        connection.getConnection = originalGetConnection
    }
})

test("item creation reports failed insertions instead of false success", async () => {
    const { createItem } = require("../server/utils/DB.utils")
    const connection = Connection.getInstance()
    const originalQuery = connection.query
    connection.query = async (query, throwOnError) => {
        if (query.startsWith("insert into item")) {
            assert.equal(throwOnError, true)
            throw new Error("Simulated item insertion failure")
        }
        return []
    }
    try {
        const result = await createItem({
            id: 26901,
            prix: 850,
            date_achat: "01.01.2026",
            fin_garantie: "01.01.2028"
        }, false)
        assert.equal(result.success, false)
    } finally {
        connection.query = originalQuery
    }
})

test("20 imported items share category lookups and avoid ID-generation queries", async () => {
    const connection = Connection.getInstance()
    const originalQuery = connection.query
    const queries = []
    connection.query = async query => {
        queries.push(query)
        if (query.toLowerCase().includes("inner join droit")) return [{ name: "ECRIRE" }]
        if (query.startsWith("select id from ") && query.includes("where nom = '")) return []
        if (query.startsWith("insert into ")) return { insertId: 1 }
        return []
    }
    try {
        const items = Array.from({ length: 20 }, (_, i) => ({
            id: 26901 + i, materiel: "DEMO Portable", marque: "DEMO Dell",
            modele: "DEMO", num_serie: `FAKE-${i}`, num_produit: `FAKE-${i}`,
            section: "DEMO Section", etat: "DEMO Fonctionnel", lieu: "DEMO Salle",
            remarque: "Test", date_achat: "2026-01-01", garantie: 2,
            fin_garantie: "2028-01-01", prix: 850, archive: 0
        }))
        const response = await fetch(`${baseUrl}/item/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${signJWT({ id: 1 }, "30m")}`
            },
            body: JSON.stringify({ items })
        })
        assert.equal(response.status, 200)
        assert.deepEqual(await response.json(), { errors: [] })
        assert.equal(queries.filter(query => query.startsWith("insert into item ")).length, 20)
        assert.equal(queries.filter(query => query.includes("where nom = '")).length, 5)
        assert.equal(queries.filter(query => query.startsWith("insert into ") && !query.startsWith("insert into item ")).length, 5)
        assert.equal(queries.filter(query => query.includes("SUBSTRING")).length, 0)
    } finally {
        connection.query = originalQuery
    }
})

test("category lookup failures return JSON with CORS instead of leaving import pending", async () => {
    const connection = Connection.getInstance()
    const originalQuery = connection.query
    connection.query = async query => {
        if (query.toLowerCase().includes("inner join droit")) return [{ name: "ECRIRE" }]
        throw new Error("Simulated category lookup timeout")
    }
    try {
        const response = await fetch(`${baseUrl}/item/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "https://inventory.example.com",
                Cookie: `accessToken=${signJWT({ id: 1 }, "30m")}`
            },
            body: JSON.stringify({ items: [{ id: 26901, materiel: "DEMO" }] })
        })
        assert.equal(response.status, 500)
        assert.equal(response.headers.get("access-control-allow-origin"), "https://inventory.example.com")
        assert.equal((await response.json()).errors.length, 1)
    } finally {
        connection.query = originalQuery
    }
})
