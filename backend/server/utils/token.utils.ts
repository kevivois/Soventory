import jwt from "jsonwebtoken"
import { createPrivateKey, createPublicKey } from "crypto"
import { requiredEnv } from "../config"

const privateKey = createPrivateKey(requiredEnv("JWT_PRIVATE_KEY").replace(/\\n/g, "\n"))
if (privateKey.asymmetricKeyType !== "rsa" || (privateKey.asymmetricKeyDetails?.modulusLength || 0) < 2048) {
    throw new Error("JWT_PRIVATE_KEY must be an RSA key of at least 2048 bits")
}
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" })
const publicKeyPem = createPublicKey(privateKey).export({ type: "spki", format: "pem" })

export function verifyJWT(token: string) {
    try {
        const decoded = jwt.verify(token, publicKeyPem, { algorithms: ["RS256"] })
        if (typeof decoded === "string") {
            return { user: null, expired: false }
        }
        return { user: decoded, expired: false }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return { user: null, expired: error instanceof jwt.TokenExpiredError }
        }
        throw error
    }
}

export function signJWT(payload: object, expiresIn: string | number | undefined) {
    return jwt.sign(payload, privateKeyPem, {
        algorithm: "RS256",
        ...(expiresIn === undefined ? {} : { expiresIn })
    })
}
