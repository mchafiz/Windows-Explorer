const BASE = import.meta.env.VITE_API_BASE ?? '';
async function get(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Request failed: ${res.status}`);
    }
    return res.json();
}
export const folderService = {
    async getFolders() {
        const { data } = await get('/api/v1/folders');
        return data;
    },
    async getChildren(id) {
        const { data } = await get(`/api/v1/folders/${id}/children`);
        return data;
    },
    async search(query, type = 'all') {
        const params = new URLSearchParams({ q: query, type });
        return get(`/api/v1/search?${params}`);
    },
};
