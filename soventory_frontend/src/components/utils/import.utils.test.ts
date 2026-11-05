import { importItems } from "./import.utils";

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test("imports in batches and reports partial failures", async () => {
    const fetchMock = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ imported: 9, skipped: 1, errors: ["Ligne 3 : doublon"] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ imported: 2, skipped: 0, errors: [] }) });
    global.fetch = fetchMock;
    const summary = await importItems(Array.from({ length: 12 }, (_, id) => ({ id })));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).items).toHaveLength(10);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).items).toHaveLength(2);
    expect(summary).toContain("11 ligne(s) ajoutee(s), 1 rejetee(s)");
    expect(summary).toContain("doublon");
});

test("network failure stops subsequent batches and reports uncertain results", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("Failed to fetch"));
    global.fetch = fetchMock;
    const summary = await importItems(Array.from({ length: 25 }, (_, id) => ({ id })));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(summary).toContain("Import interrompu");
    expect(summary).toContain("inconnu");
});
