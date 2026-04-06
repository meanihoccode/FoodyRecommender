import pandas as pd
import mysql.connector
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np  # Dùng để xử lý mảng và phép toán logarit
import json

print("1. Đang kết nối Database và lấy dữ liệu...")
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",  # <--- THAY MẬT KHẨU CỦA BẠN NẾU CẦN
    database="foodyrecommend"
)
cursor = db.cursor(dictionary=True)

# LẤY THÊM CỘT 'rating' VÀ 'rating_count' TỪ CSDL
cursor.execute("SELECT id, name, category, description, price_average, address, rating, rating_count FROM restaurants")
rows = cursor.fetchall()
df = pd.DataFrame(rows)

print(f"-> Đã lấy thành công {len(df)} nhà hàng.")

print("2. Đang tiền xử lý và tải mô hình AI...")
# Xử lý an toàn: rating rỗng -> 0.0, rating_count rỗng -> 0, các cột chữ -> chuỗi rỗng
df['rating'] = df['rating'].fillna(0.0)
df['rating_count'] = df['rating_count'].fillna(0)
df.fillna('', inplace=True)

# Gộp các trường văn bản lại để tạo thành 'content' phong phú cho AI đọc
df['content'] = df['name'] + ". Thể loại: " + df['category'] + ". Mô tả: " + df['description'] + ". Giá: " + df['price_average'] + ". Địa chỉ: " + df['address']

# Tải mô hình Sentence-Transformer
print("-> Đang tải model NLP...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

print("3. Đang mã hóa dữ liệu văn bản thành Vector (Embeddings)...")
embeddings = model.encode(df['content'].tolist(), show_progress_bar=True)

print("4. Đang tính toán Cosine Similarity...")
cosine_sim = cosine_similarity(embeddings, embeddings)

# --- CHUẨN BỊ MẢNG DỮ LIỆU CHO CÔNG THỨC HYBRID ---
print("5. Đang chuẩn hóa dữ liệu Điểm số và Độ phổ biến...")

# 1. Chuẩn hóa Rating về thang điểm 0 -> 1 (chia cho 5.0)
normalized_ratings = df['rating'].values / 5.0

# 2. Chuẩn hóa Độ phổ biến (Popularity) dựa trên rating_count
# Dùng log1p (tức là log(x+1)) để làm mượt dữ liệu, tránh việc quán 1000 lượt vote đè bẹp hoàn toàn quán 10 lượt vote
popularity_log = np.log1p(df['rating_count'].values)
max_pop = popularity_log.max()
if max_pop == 0:
    max_pop = 1 # Tránh lỗi chia cho 0 nếu Database mới tinh chưa ai vote
normalized_popularity = popularity_log / max_pop

print("6. Đang áp dụng công thức HYBRID và lưu danh sách gợi ý...")
cursor.execute("TRUNCATE TABLE recommendations")

recommendations_data = []

# Duyệt qua từng nhà hàng để tìm ra 10 quán xuất sắc nhất
for index, row in df.iterrows():
    rest_id = row['id']

    # Lấy mảng điểm Cosine Similarity của nhà hàng này với tất cả quán khác
    sim_scores = cosine_sim[index]

    # --- ÁP DỤNG CÔNG THỨC HYBRID MỚI TẠI ĐÂY ---
    # Trọng số: Nội dung giống nhau (50%) + Điểm cao (30%) + Nhiều người ăn/Độ phổ biến (20%)
    hybrid_scores = (sim_scores * 0.5) + (normalized_ratings * 0.3) + (normalized_popularity * 0.2)

    # Gán điểm của chính nhà hàng đang xét thành -1 để nó không tự gợi ý chính nó
    hybrid_scores[index] = -1

    # Lấy ra index của top 10 nhà hàng có hybrid_score cao nhất
    # argsort() sắp xếp tăng dần, nên ta lấy 10 phần tử cuối và [::-1] để đảo ngược thành giảm dần
    top_indices = hybrid_scores.argsort()[-10:][::-1]

    # Lấy ra ID thật của các nhà hàng trong database dựa trên index vừa tìm được
    similar_restaurant_ids = [int(df.iloc[i]['id']) for i in top_indices]

    # Chuyển list ID thành chuỗi JSON để lưu vào MySQL
    recommendations_data.append((rest_id, json.dumps(similar_restaurant_ids)))

# Bulk insert toàn bộ dữ liệu vào MySQL
sql = "INSERT INTO recommendations (restaurant_id, similar_restaurant_ids) VALUES (%s, %s)"
cursor.executemany(sql, recommendations_data)
db.commit()

print(f"\n🎉 HOÀN TẤT TUYỆT ĐỐI! Đã cập nhật AI Recommendations (Hybrid: Nội dung 50% + Điểm số 30% + Phổ biến 20%) cho {len(recommendations_data)} nhà hàng.")

cursor.close()
db.close()