package com.example.foodyrecommender.api;


import com.example.foodyrecommender.entity.Restaurant;
import com.example.foodyrecommender.repository.RestaurantRepository;
import com.example.foodyrecommender.service.RestaurantService;
import com.example.foodyrecommender.service.UserService;
import org.hibernate.query.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable int id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        if (restaurant != null) {
            return ResponseEntity.ok(restaurant);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Trong RestaurantController.java
    @GetMapping("/list")
    public ResponseEntity<List<Restaurant>> getRestaurantsByIds(@RequestParam List<Integer> ids) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByIds(ids);
        return ResponseEntity.ok(restaurants);
    }

    // Trong file RestaurantController.java
    @GetMapping("/search")
    public ResponseEntity<Page<Restaurant>> searchRestaurants(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "") String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy) { // Thêm tham số sortBy

        // 1. Khởi tạo quy tắc sắp xếp (Mặc định là theo tên A-Z)
        // Viết rõ Sort.Order ra để IDE không bị nhầm lẫn
        Sort sort = Sort.by(Sort.Order.asc("name"));

        // 2. Bắt các trường hợp người dùng chọn Sắp xếp theo giá
        if ("price-asc".equals(sortBy)) {
            // Giá thấp đến cao (null đẩy xuống cuối)
            sort = Sort.by(Sort.Order.asc("minPrice").nullsLast());

        } else if ("price-desc".equals(sortBy)) {
            // Giá cao đến thấp (null đẩy xuống cuối)
            sort = Sort.by(Sort.Order.desc("minPrice").nullsLast());
        }

        // 3. Nhét cục Sort vào Pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // 4. Gọi Service như bình thường (Query của bạn sẽ tự động được Spring gắn thêm lệnh ORDER BY)
        Page<Restaurant> results = restaurantService.searchRestaurants(keyword, category, pageable);
        return ResponseEntity.ok(results);
    }

    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        Restaurant createdRestaurant = restaurantService.createRestaurant(restaurant);
        return ResponseEntity.status(201).body(createdRestaurant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable int id, @RequestBody Restaurant restaurant) {
        Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurant);
        if (updatedRestaurant != null) {
            return ResponseEntity.ok(updatedRestaurant);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable int id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/fix-prices")
    public ResponseEntity<String> autoFixPrices() {
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        int count = 0;

        for (Restaurant r : allRestaurants) {
            String priceStr = r.getPriceAverage();

            // Chỉ xử lý nếu có giá tiền
            if (priceStr != null && !priceStr.isEmpty() && !priceStr.equalsIgnoreCase("Liên hệ")) {
                try {
                    String minPart = priceStr.toLowerCase().replaceAll("\\s+", "").split("-")[0];

                    double multiplier = 1;
                    if (minPart.contains("tr")) {
                        multiplier = 1000000;
                    } else if (minPart.contains("k")) {
                        multiplier = 1000;
                    }

                    String numStr = minPart.replaceAll("[^0-9.]", "");

                    if (!numStr.isEmpty()) {
                        double val = Double.parseDouble(numStr);
                        Integer calculatedMinPrice = (int) (val * multiplier);

                        // SỬ DỤNG LỆNH BẮN TỈA TẠI ĐÂY (Bỏ qua Validation)
                        restaurantRepository.updateMinPriceDirectly(r.getId(), calculatedMinPrice);
                        count++;
                    }
                } catch (Exception e) {
                    // Âm thầm bỏ qua những quán có giá ghi quá linh tinh
                }
            }
        }

        return ResponseEntity.ok("Đã cập nhật giá minPrice thành công cho " + count + " nhà hàng!");
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countRestaurants() {
        return ResponseEntity.ok(restaurantService.countRestaurants());
    }
}
