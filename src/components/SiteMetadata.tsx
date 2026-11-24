import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteMetadata() {
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data, error } = await supabase.from("website_metadata").select("title,description").limit(1);
      if (!active || error) return;
      const row = data?.[0];
      if (!row) return;
      const { title, description } = row;
      if (title) document.title = title;
      for (const [attribute, key, content] of [
        ["name", "description", description], ["property", "og:title", title],
        ["property", "og:description", description], ["name", "twitter:title", title],
        ["name", "twitter:description", description],
      ]) {
        let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
        if (!meta) { meta = document.createElement("meta"); meta.setAttribute(attribute, key); document.head.appendChild(meta); }
        meta.content = content;
      }
    };
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.removeEventListener("focus", onFocus); };
  }, []);
  return null;
}