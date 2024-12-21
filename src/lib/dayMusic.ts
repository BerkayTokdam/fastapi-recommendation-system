import { supabase } from "../lib/supabase";

export type DayMusic = {
    url: string;
    title: string;
    artist: string;
    genre: string[];
    artwork: string;
    rating: number;
    playlist: string[];
    listened_at: string; // Zorunlu alan
};

// Şarkıyı day_music tablosuna eklemek için
export const saveToDayMusic = async (track: DayMusic, userId: string) => {
    const { error } = await supabase.from("day_music").insert({
        user_id: userId,
        ...track,
    });

    if (error) {
        console.error("Error saving to day_music:", error.message);
        throw new Error("Failed to save track.");
    }
    console.log("Track saved successfully!");
};

// Kullanıcının günlük şarkılarını almak için
export const getDayMusic = async (userId: string): Promise<DayMusic[]> => {
    const { data, error } = await supabase
        .from("day_music")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching day_music:", error.message);
        throw new Error("Failed to fetch tracks.");
    }

    return data || [];
};

// Kullanıcının günlük şarkılarını temizlemek için
export const clearDayMusic = async (userId: string) => {
    const { error } = await supabase
        .from("day_music")
        .delete()
        .eq("user_id", userId);

    if (error) {
        console.error("Error clearing day_music:", error.message);
        throw new Error("Failed to clear tracks.");
    }

    console.log("Day music cleared successfully.");
};
