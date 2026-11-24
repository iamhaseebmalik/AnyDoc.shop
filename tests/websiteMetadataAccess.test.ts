import { describe, expect, it } from "bun:test";

const url = process.env.SUPABASE_DB_URL || process.env.DB_URL;

// Guards the rule that visitors may only ever see the page title and description,
// never the full website settings record.
const suite = url ? describe : describe.skip;

// psql speaks the simple query protocol. The database is reached through a
// transaction pooler that rejects prepared statements, which is what Bun's SQL
// client uses, so queries go through psql instead.
const value = (query: string) =>
  Bun.spawnSync(["psql", url!, "-tAc", query]).stdout.toString().trim();

const privilege = (role: string, table: string, kind: string) =>
  value(`select has_table_privilege('${role}', 'public.${table}', '${kind}')`);

suite("website metadata exposure", () => {
  it("blocks anonymous and signed-in reads of the full settings record", () => {
    expect(privilege("anon", "website_settings", "SELECT")).toBe("f");
    expect(privilege("authenticated", "website_settings", "SELECT")).toBe("f");
  });

  it("allows both visitors and signed-in users to read the published metadata", () => {
    expect(privilege("anon", "website_metadata", "SELECT")).toBe("t");
    expect(privilege("authenticated", "website_metadata", "SELECT")).toBe("t");
  });

  it("publishes only the title and description columns", () => {
    const columns = value(
      "select column_name from information_schema.columns" +
        " where table_schema = 'public' and table_name = 'website_metadata' order by column_name",
    )
      .split("\n")
      .filter(Boolean);
    expect(columns).toEqual(["description", "title"]);
  });

  it("keeps no policy that lets anyone read every settings row", () => {
    expect(value("select count(*) from pg_policy where polrelid = 'public.website_settings'::regclass")).toBe("0");
  });

  it("keeps the settings record writable only by the registration service", () => {
    expect(privilege("service_role", "website_settings", "INSERT")).toBe("t");
    expect(privilege("anon", "website_settings", "INSERT")).toBe("f");
    expect(privilege("authenticated", "website_settings", "UPDATE")).toBe("f");
    expect(privilege("anon", "website_metadata", "INSERT")).toBe("f");
  });
});
