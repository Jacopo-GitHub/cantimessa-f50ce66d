import { supabase } from "@/integrations/supabase/client";

export const MASS_PARTS = [
  { key: "inizio", label: "Inizio" },
  { key: "kyrie", label: "Kyrie" },
  { key: "gloria", label: "Gloria" },
  { key: "alleluja", label: "Alleluja" },
  { key: "offertorio", label: "Offertorio" },
  { key: "santo", label: "Santo" },
  { key: "agnello", label: "Agnello di Dio" },
  { key: "comunione", label: "Comunione" },
  { key: "fine", label: "Fine" },
] as const;

export type MassPartKey = (typeof MASS_PARTS)[number]["key"];

export type Song = {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  original_name: string | null;
  created_at: string;
};

export type Assignment = {
  part: MassPartKey;
  song_id: string | null;
  updated_at: string;
};

export async function listSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Song[];
}

export async function listAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase.from("mass_assignments").select("*");
  if (error) throw error;
  return (data ?? []) as Assignment[];
}

export async function setAssignment(part: MassPartKey, songId: string | null) {
  const { error } = await supabase
    .from("mass_assignments")
    .upsert({ part, song_id: songId, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("songs")
    .createSignedUrl(path, 60 * 60); // 1h
  if (error) throw error;
  return data.signedUrl;
}

export function classifyFile(file: File): "pdf" | "image" | "docx" | "unsupported" {
  const n = file.name.toLowerCase();
  if (file.type === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/.test(n)) return "image";
  if (
    n.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  return "unsupported";
}

export async function uploadSong(file: File, title: string): Promise<Song> {
  const kind = classifyFile(file);
  if (kind === "unsupported") {
    throw new Error("Formato non supportato. Usa PDF, JPG, PNG o DOCX.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "canto";
  const path = `${Date.now()}-${safe}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("songs")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from("songs")
    .insert({
      title,
      file_path: path,
      file_type: kind,
      original_name: file.name,
    })
    .select()
    .single();
  if (error) {
    await supabase.storage.from("songs").remove([path]);
    throw error;
  }
  return data as Song;
}

export async function deleteSong(song: Song) {
  await supabase.storage.from("songs").remove([song.file_path]);
  const { error } = await supabase.from("songs").delete().eq("id", song.id);
  if (error) throw error;
}