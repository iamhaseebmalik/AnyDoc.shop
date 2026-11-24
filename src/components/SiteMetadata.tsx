import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteMetadata() {
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data, error } = await supabase.from("website_settings").select("title,description").eq("id", true).maybeSingle();
      if (!active || error || !data) return;
      document.title = data.title;
      for (const [attribute, key, content] of [
        ["name", "description", data.description], ["property", "og:title", data.title],
        ["property", "og:description", data.description], ["name", "twitter:title", data.title],
        ["name", "twitter:description", data.description],
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