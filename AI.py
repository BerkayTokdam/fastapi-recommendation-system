import os
import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import nest_asyncio
from uvicorn import Config, Server
from typing import List

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

# JSON dosyasını yükleme fonksiyonu
def load_json(file_path: str) -> pd.DataFrame:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        return pd.DataFrame(data)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"File not found: {file_path}")

# Özellik işleme fonksiyonu
def process_features(df: pd.DataFrame) -> pd.DataFrame:
    df["genre"] = df["genre"].apply(lambda x: ",".join(x) if isinstance(x, list) else str(x))
    df["features"] = df["genre"] + " " + df["artist"]
    return df

# Kullanıcının günlük müziklerini Supabase'den çekme
def fetch_day_music(user_id: str) -> pd.DataFrame:
    response = supabase.table("day_music").select("title,artist,genre").eq("user_id", user_id).execute()
    if response.data:
        return pd.DataFrame(response.data)
    else:
        raise HTTPException(status_code=404, detail="No daily music found for this user.")

# Öneri işlevi
def recommend_songs(day_library_df: pd.DataFrame, library_df: pd.DataFrame, num_recommendations: int = 10) -> pd.DataFrame:
    # TF-IDF vektörleştirme
    tfidf_vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf_vectorizer.fit_transform(library_df["features"])

    # Rating değerlerini normalize et
    scaler = MinMaxScaler()
    library_df["normalized_rating"] = scaler.fit_transform(library_df[["rating"]])

    # TF-IDF vektörleri ile rating'i birleştir
    combined_features = np.hstack([tfidf_matrix.toarray(), library_df["normalized_rating"].values.reshape(-1, 1)])

    # K-Means modeli
    num_clusters = 7
    kmeans = KMeans(n_clusters=num_clusters, n_init=10, random_state=42)
    kmeans.fit(combined_features)
    library_df["cluster"] = kmeans.labels_

    # Kullanıcı tarafından dinlenen şarkılar için öneriler
    recommendations = []
    for _, row in day_library_df.iterrows():
        song_vec = tfidf_vectorizer.transform([row["features"]])
        song_combined_vec = np.hstack([song_vec.toarray(), [[0]]])
        similarities = cosine_similarity(song_combined_vec, combined_features)
        top_indices = similarities[0].argsort()[-num_recommendations:][::-1]
        recommended = library_df.iloc[top_indices]
        recommendations.append(recommended)

    return pd.concat(recommendations).drop_duplicates(subset=["title", "artist", "genre"]).head(num_recommendations)

# API modeli
class RecommendationRequest(BaseModel):
    user_id: str

@app.post("/recommend")
async def recommend_songs_endpoint(request: RecommendationRequest):
    try:
        user_id = request.user_id
        day_music_data = fetch_day_music(user_id)
        day_library_df = process_features(day_music_data)

        # Library JSON'u yükle ve işlem yap
        library_df = load_json(library_file)
        library_df = process_features(library_df)

        # Öneri oluştur
        recommendations = recommend_songs(day_library_df, library_df)
        return {"recommendations": recommendations.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FastAPI sunucusu
config = Config(app=app, host="0.0.0.0", port=8000, reload=False)
server = Server(config=config)

if __name__ == "__main__":
    server.run()
