import { createAdminForgeApi } from "@adminforge/core/next";
import { getConfig, getDb } from "../../../lib/adminforge";

import { auth } from "../../../lib/auth";

const config = getConfig();
const db = getDb();

export const { GET, POST, PATCH, DELETE } = createAdminForgeApi({ config, db, auth });
