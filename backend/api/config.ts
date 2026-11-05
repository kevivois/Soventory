export function requiredEnv(name: string): string {
    const value = process.env[name]
    if (!value || !value.trim()) {
        throw new Error(`Missing environment variable: ${name}`)
    }
    return value
}
