import { Filtering, Sorting } from "../Filter.utils";
import { filterAndSortRows } from "./tableData.utils";

const materielHeader = { key: "materiel", labelName: "Matériel", id: 1, mode: 0 };
const etatHeader = { key: "etat", labelName: "État", id: 2, mode: 0 };
const idHeader = { key: "id", labelName: "Id", id: 0, mode: 0 };
const rows = [
    { id: 10, materiel: { nom: "Caméra" }, etat: { nom: "Actif" }, modele: "Café" },
    { id: 2, materiel: { nom: "Caméra" }, etat: { nom: "En panne" }, modele: "Cafe" },
    { id: 1, materiel: { nom: "Écran" }, etat: { nom: "Actif" }, modele: "Cafe" },
];

test("combines column filters with AND and values within one filter with OR", () => {
    const filters = [
        new Filtering(materielHeader, [
            { nom: "Caméra", checked: true },
            { nom: "Écran", checked: true },
        ]),
        new Filtering(etatHeader, [{ nom: "Actif", checked: true }]),
    ];

    const result = filterAndSortRows(rows, filters, "", new Sorting(idHeader, "asc"));

    expect(result.map((row) => row.id)).toEqual([1, 10]);
});

test("search is accent-insensitive and sorting compares numeric values naturally", () => {
    const result = filterAndSortRows(rows, [], "cafe", new Sorting(idHeader, "asc"));

    expect(result.map((row) => row.id)).toEqual([1, 2, 10]);
});
