export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/login",
        LOGOUT: "/user/logout",
        ME: "/user",
    },
    ADMIN: {
        CREATE_PROJECT: "/admin/projects/",
        DELETE_PROJECT: "/admin/projects/{id}",
        RENAME_PROJECT: "/admin/projects/{id}/name",
        PROJECTS_LIST: "/admin/projects",
        PROJECT_USERS: {
            LIST: "/admin/projects/{project_id}/users",
            ADD: "/admin/projects/{project_id}/users/add/{user_id}",
            REMOVE: "/admin/projects/{project_id}/users/remove/{user_id}",
        },
        EXPORT: {
            PREVIEW: "/admin/projects/{project_id}/export/preview",
            DOWNLOAD: "/admin/projects/{project_id}/export",
        },
        USERS: {
            LIST: "/admin/users",
            CREATE: "/admin/users",
            DELETE: "/admin/users/{user_id}",
            DISABLE: "/admin/users/{user_id}/disable",
            ENABLE: "/admin/users/{user_id}/enable",
            PROMOTE: "/admin/users/promote/{user_id}",
            DEMOTE: "/admin/users/demote/{user_id}",
            PROJECTS: "/admin/users/{user_id}/projects",
        },
        FORM_FIELDS: {
            CREATE: "/admin/projects/{project_id}/form-fields",
            REORDER: "/admin/projects/{project_id}/form-fields/reorder",
            UPDATE: "/admin/projects/{project_id}/form-fields/{field_id}",
            DELETE: "/admin/projects/{project_id}/form-fields/{field_id}",
        },
    },
    PROJECTS: {
        LIST: "/projects",
        LIST_FORM_FIELDS: "/projects/{project_id}/form-fields",
    },
    ALGORITHMS: {
        LIST: "/algorithms",
        APPLY: "/projects/{project_id}/algorithm",
    },
    USER: {
        UPDATE_USERNAME: "/user/username",
        UPDATE_PASSWORD: "/user/password",
        DISABLE_ACCOUNT: "/user/disable",
    },
    MUTANTS: {
        BY_PROJECT: "/projects/{project_id}/mutants",
        BY_ID: "/mutants/{mutant_id}",
    },
    RATINGS: {
        GET: "/mutants/{mutant_id}/ratings",
        SUBMIT: "/mutants/{mutant_id}/ratings",
    },
} as const;
