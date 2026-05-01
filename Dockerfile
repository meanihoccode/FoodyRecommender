# 1. Mượn một máy chủ có sẵn Java và Maven để build code
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . /app/
RUN mvn clean package -DskipTests

# 2. Lấy file .jar vừa build xong đem đi chạy
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]a