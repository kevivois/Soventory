import getIp from "../../IP"

export async function importItems(items: unknown[]): Promise<string> {
    let imported = 0
    let skipped = 0
    const errors: string[] = []
    for (let offset = 0; offset < items.length; offset += 10) {
        try {
            const response = await fetch(`${getIp()}/item/import`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: items.slice(offset, offset + 10) })
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const result = await response.json()
            if (!Number.isInteger(result.imported) || !Number.isInteger(result.skipped) ||
                !Array.isArray(result.errors) || !result.errors.every((error: unknown) => typeof error === "string")) {
                throw new Error("reponse d'import invalide")
            }
            imported += result.imported
            skipped += result.skipped
            errors.push(...result.errors.map((error: string) => `Lot ${offset / 10 + 1} : ${error}`))
        } catch (error) {
            return `${imported} ligne(s) ajoutee(s), ${skipped} rejetee(s). Import interrompu : ${error instanceof Error ? error.message : String(error)}. ` +
                `Resultat du lot commencant a la ligne ${offset + 2} inconnu : verifiez les identifiants en base avant de reessayer. ${errors.join(" ; ")}`
        }
    }
    return `${imported} ligne(s) ajoutee(s), ${skipped} rejetee(s). ${errors.join(" ; ")}`
}
