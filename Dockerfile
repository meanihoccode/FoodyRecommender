# 1. Mượn một máy chủ có sẵn JDK để build code bằng Gradle
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . /app/
# Cấp quyền thực thi cho Gradle Wrapper và tiến hành build (bỏ qua test)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2. Lấy file .jar vừa build xong đem đi chạy
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Lưu ý: Gradle sẽ lưu file chạy ở thư mục build/libs (khác với Maven lưu ở target)
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]