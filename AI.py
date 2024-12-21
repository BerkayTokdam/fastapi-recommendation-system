import os
import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import nest_asyncio
from uvicorn import Config, Server
from uuid import UUID

# Supabase Ayarları
SUPABASE_URL = "https://ksuzrlinbncwfrgwdrdf.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdXpybGluYm5jd2ZyZ3dkcmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODEzOTksImV4cCI6MjA0ODQ1NzM5OX0.hOKqPK5IS0oj-C002-rVOfb0UdZRWP1yToMN8Lr4uX4"

# Supabase istemcisi
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# FastAPI uygulaması
nest_asyncio.apply()
app = FastAPI()

# JSON dosya yolu
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
library_file = os.path.join(BASE_DIR, "assets", "data", "library.json")

# Kullanıcı ID'sini doğrulamak için API modeli
class MusicRequest(BaseModel):
    user_id: UUID

# JSON dosyasını yükleme fonksiyonu
def load_json(file_path: str) -> pd.DataFrame:
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return pd.DataFrame(data)

# Supabase'den day_music tablosuna erişim ve verilerin çekilmesi
def fetch_day_music(user_id: str) -> pd.DataFrame:
    try:
        response = supabase.table("day_music").select("title,artist").eq("user_id", user_id).execute()
        if response.data:
            return pd.DataFrame(response.data)
        else:
            raise HTTPException(status_code=404, detail="No music data found for this user.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase fetch error: {e}")

# K-Means ve öneri oluşturma fonksiyonu
def recommend_songs(day_music_df: pd.DataFrame, library_df: pd.DataFrame, num_clusters: int = 7, num_recommendations: int = 10) -> pd.DataFrame:
    # TF-IDF vektörleştirme
    tfidf_vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf_vectorizer.fit_transform(library_df["features"])

    # K-Means modeli
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    library_df["cluster"] = kmeans.fit_predict(tfidf_matrix)

    # Kullanıcının dinlediği şarkıların gruplarını bul
    listened_features = tfidf_vectorizer.transform(day_music_df["title"] + " " + day_music_df["artist"])
    listened_clusters = kmeans.predict(listened_features)

    # Benzer gruptaki şarkıları öner
    recommendations = library_df[library_df["cluster"].isin(listened_clusters)].sample(n=num_recommendations, random_state=42)
    return recommendations[["title", "artist", "url"]]

# FastAPI endpoint
@app.post("/recommend_songs")
async def recommend_songs_endpoint(request: MusicRequest):
    try:
        user_id = str(request.user_id)

        # Günlük müzikleri çek
        day_music_data = fetch_day_music(user_id)

        # Library JSON'u yükle
        library_df = load_json(library_file)
        library_df["features"] = library_df["title"] + " " + library_df["artist"]

        # Öneri oluştur
        recommendations = recommend_songs(day_music_data, library_df)

        return {"recommendations": recommendations.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FastAPI sunucusu
config = Config(app=app, host="0.0.0.0", port=8000, reload=False)
server = Server(config=config)

if __name__ == "__main__":
    print("Starting FastAPI server...")
    server.run()
