package com.example.foodyrecommender.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class RecommendationTask {

    // Cron expression: Giây Phút Giờ Ngày Tháng Thứ
    // "0 0 2 * * ?" = Đúng 02:00:00 sáng mỗi ngày
     @Scheduled(cron = "0 0 2 * * ?")
//     @Scheduled(fixedDelay = 60000) // Đang test 60s/lần
    public void runPythonRecommendation() {
        System.out.println("--- BẮT ĐẦU CHẠY CẬP NHẬT GỢI Ý AI ---");

        try {
            // 1. CHỈ ĐÍCH DANH ĐƯỜNG DẪN TỚI PYTHON TRONG MÔI TRƯỜNG ẢO (VENV)
            String pythonExePath = "D:/KtraGiuaKi/.venv/Scripts/python.exe";

            // 2. Đường dẫn đến file script của bạn
            String pythonScriptPath = "C:/Users/Admin/Documents/TTCS/FoodyRecommender/ai-engine/recommendation_engine.py";

            // 3. Thực thi bằng file pythonExePath vừa khai báo
            // Thêm cờ "-X" và "utf8" để ép Python in ra tiếng Việt chuẩn chỉ
            ProcessBuilder pb = new ProcessBuilder(pythonExePath, "-X", "utf8", pythonScriptPath);
            pb.redirectErrorStream(true); // Gộp lỗi vào luồng output để dễ log

            Process p = pb.start();

            // Đọc log từ file Python trả về để xem nó chạy đến đâu
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream(), "UTF-8")); // Thêm UTF-8 để không lỗi font tiếng Việt
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("Python Log: " + line);
            }

            int exitCode = p.waitFor();
            if (exitCode == 0) {
                System.out.println("--- KẾT THÚC THÀNH CÔNG. Exit Code: " + exitCode + " ---");
            } else {
                System.err.println("--- KẾT THÚC VỚI LỖI. Exit Code: " + exitCode + " ---");
            }

        } catch (Exception e) {
            System.err.println("Lỗi hệ thống khi thực thi script Python: " + e.getMessage());
            e.printStackTrace();
        }
    }
}