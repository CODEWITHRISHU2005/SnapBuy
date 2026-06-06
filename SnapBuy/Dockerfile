FROM eclipse-temurin:21-jdk-jammy as deps

WORKDIR /build

COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw dependency:go-offline -DskipTests


FROM deps as package

WORKDIR /build

COPY ./src src/

RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

# DEBUG: Show exactly what Spring Boot version is in the JAR
RUN unzip -p target/app.jar BOOT-INF/lib/spring-boot-*.jar 2>/dev/null | strings | grep "Spring Boot" | head -5 || true
RUN unzip -l target/app.jar | grep "spring-boot-[0-9]" | head -10 || true
RUN unzip -l target/app.jar | grep "spring-ai" | head -10 || true


FROM eclipse-temurin:21-jre-jammy AS final

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=extract build/target/extracted/dependencies/ ./
COPY --from=extract build/target/extracted/spring-boot-loader/ ./
COPY --from=extract build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract build/target/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT [ "java", "org.springframework.boot.loader.launch.JarLauncher" ]