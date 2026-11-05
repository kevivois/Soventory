import Connection from "../Connection"
import { formatToDBDate } from "./DB.utils"

const categories = ["materiel", "marque", "section", "etat", "lieu"] as const
const required = ["id", ...categories, "modele", "date_achat", "garantie", "fin_garantie", "prix"]

function dateValue(value: unknown): string {
    const date = String(formatToDBDate(value))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date) {
        throw new Error("date invalide (formats acceptes : AAAA-MM-JJ, JJ.MM.AAAA, JJ/MM/AAAA)")
    }
    return date
}

function numberValue(value: unknown, name: string, integer = false): number {
    const number = Number(String(value).replace(",", "."))
    if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
        throw new Error(`${name} invalide`)
    }
    return number
}

function hasCode(error: unknown): error is { code: unknown } {
    return typeof error === "object" && error !== null && "code" in error
}

function databaseError(error: unknown): string {
    if (hasCode(error)) {
        if (error.code === "ER_DUP_ENTRY") return "identifiant deja existant"
        return `erreur de base de donnees (${String(error.code)})`
    }
    return "erreur de base de donnees"
}

export async function importItems(items: unknown[]) {
    const connection = Connection.getInstance()
    const cache = new Map<string, number>()
    const errors: string[] = []
    let imported = 0
    const deadline = Date.now() + 40000
    for (const [index, raw] of items.entries()) {
        const label = `Ligne ${index + 2}`
        if (Date.now() >= deadline) {
            errors.push(`${label} : non importee, limite de temps atteinte. Importez cette ligne dans un nouveau lot.`)
            continue
        }
        let item: Record<string, unknown>
        let values: unknown[]
        try {
            if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new Error("ligne invalide")
            item = { ...raw }
            for (const key of required) {
                if (item[key] === null || item[key] === undefined || String(item[key]).trim() === "") {
                    throw new Error(`champ ${key} requis`)
                }
            }
            let id = String(item.id).trim()
            if (/^\d{6}$/.test(id)) {
                const suffix = id.slice(-4)
                id = Number(suffix) > 999
                    ? id.slice(1, 3) + id.slice(-3)
                    : id.slice(0, 2) + suffix.replace("0", "")
            }
            if (!/^\d{5}$/.test(id)) throw new Error("id attendu : 5 chiffres (ou ancien format a 6 chiffres)")
            item.id = Number(id)
            const archive = item.archive === undefined || item.archive === null || item.archive === ""
                ? 0 : numberValue(item.archive, "archive", true)
            if (archive !== 0 && archive !== 1) throw new Error("archive doit valoir 0 ou 1")
            values = [Number(item.id), String(item.modele), String(item.num_serie ?? ""),
                String(item.num_produit ?? ""), String(item.remarque ?? ""),
                dateValue(item.date_achat), Math.round(numberValue(item.prix, "prix") * 20) / 20,
                numberValue(item.garantie, "garantie", true), dateValue(item.fin_garantie)]
            item.archive = archive
        } catch (error) {
            errors.push(`${label} : ${error instanceof Error ? error.message : "ligne invalide"}`)
            continue
        }
        try {
            for (const table of categories) {
                if (Date.now() >= deadline) throw new Error("Import time budget exhausted")
                const name = String(item[table]).trim()
                const key = JSON.stringify([table, name])
                let id = cache.get(key)
                if (id === undefined) {
                    // LAST_INSERT_ID returns the existing ID atomically, even across concurrent imports.
                    const result = await connection.execute(
                        `INSERT INTO ${table} (nom) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
                        [name])
                    id = Number(result.insertId)
                    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid category ID returned by MySQL")
                    cache.set(key, id)
                }
                values.push(id)
            }
            const destroyed = ["detruit", "détruit"].includes(String(item.etat).trim().toLowerCase())
            values.push(destroyed ? 1 : item.archive)
            if (Date.now() >= deadline) throw new Error("Import time budget exhausted")
            await connection.execute(
                "INSERT INTO item (id,modele,num_serie,num_produit,remarque,date_achat,prix,garantie,fin_garantie,materiel_FK,marque_FK,section_FK,etat_FK,lieu_FK,archive) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                values)
            imported++
        } catch (error) {
            console.error(`Item import failed at row ${index + 2}`, error)
            errors.push(`${label} (id ${String(item.id)}) : ${databaseError(error)}`)
        }
    }
    return { imported, skipped: items.length - imported, errors }
}
