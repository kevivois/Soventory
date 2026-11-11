import { Filtering, Sorting } from "../Filter.utils";

function normalize(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "object" && "nom" in value) {
        return normalize((value as { nom: unknown }).nom);
    }

    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr");
}

function compareValues(left: unknown, right: unknown): number {
    if (left == null || left === "") return right == null || right === "" ? 0 : 1;
    if (right == null || right === "") return -1;

    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(left).localeCompare(String(right), "fr", { numeric: true, sensitivity: "base" });
}

export function filterAndSortRows(
    rows: any[],
    filters: Filtering[],
    search: string,
    sorting: Sorting
): any[] {
    const normalizedSearch = normalize(search.trim());

    return rows
        .filter((row) => {
            const matchesFilters = filters.every((filter) => {
                const selectedValues = filter.selectedValues.filter((value) => value.checked);
                if (selectedValues.length === 0) return true;

                const rowValue = normalize(row[filter.header.key]);
                return selectedValues.some((selected) => rowValue === normalize(selected.nom));
            });

            if (!matchesFilters || normalizedSearch === "") return matchesFilters;

            return Object.values(row)
                .map(normalize)
                .some((value) => value.includes(normalizedSearch));
        })
        .map((row, index) => ({ row, index }))
        .sort((left, right) => {
            const comparison = compareValues(
                left.row[sorting.header.key],
                right.row[sorting.header.key]
            );
            return comparison === 0
                ? left.index - right.index
                : sorting.order === "asc" ? comparison : -comparison;
        })
        .map(({ row }) => row);
}
