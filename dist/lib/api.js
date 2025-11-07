"use strict";
// src/lib/api.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = exports.ats = exports.automation = exports.comp = exports.docs = exports.org = exports.performance = exports.timeOff = exports.employees = exports.API_URL = void 0;
exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.API_URL = process.env.NEXT_PUBLIC_API_URL || "";
// Shared internal helper
function notImplemented(fn) {
    throw new Error(`Not implemented: ${fn} // TODO: Connect to backend at ${exports.API_URL || "(unset)"}`);
}
/* ================================
   STUBBED NAMESPACES (UI ONLY)
   ================================ */
exports.employees = {
    list: async () => [],
    get: async (_id) => ({}),
    create: async (_) => notImplemented("employees.create"),
    update: async (_) => notImplemented("employees.update"),
};
exports.timeOff = {
    policies: async () => [],
    requests: async () => [],
};
exports.performance = {
    cycles: async () => [],
    goals: async () => [],
};
exports.org = {
    tree: async () => ({}),
};
exports.docs = {
    list: async () => [],
};
exports.comp = {
    bands: async () => [],
};
exports.automation = {
    rules: async () => [],
};
exports.ats = {
    jobs: {
        list: async () => [],
        get: async (_id) => ({}),
    },
    pipelines: {
        list: async () => [],
    },
    candidates: {
        list: async () => [],
        get: async (_id) => ({}),
    },
    offers: {
        list: async () => [],
    },
};
exports.settings = {
    org: async () => ({}),
    roles: async () => [],
    departments: async () => [],
    locations: async () => [],
    holidays: async () => [],
    policies: async () => [],
    integrations: async () => [],
};
/* ================================
   LEGACY HELPERS (for older pages)
   ================================ */
async function get(_endpoint) {
    throw new Error("Not implemented: get // TODO: Connect backend");
}
async function post(_endpoint, _body) {
    throw new Error("Not implemented: post // TODO: Connect backend");
}
async function put(_endpoint, _body) {
    throw new Error("Not implemented: put // TODO: Connect backend");
}
async function del(_endpoint) {
    throw new Error("Not implemented: del // TODO: Connect backend");
}
//# sourceMappingURL=api.js.map