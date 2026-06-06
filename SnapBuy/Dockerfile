# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-jammy AS deps

WORKDIR /build

COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw dependency:go-offline -DskipTests

################################################################################

FROM deps AS package

WORKDIR /build

COPY ./src src/

RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

# DEBUG
RUN unzip -l target/app.jar | grep "spring-boot-[0-9]" | head -10 || true
RUN unzip -l target/app.jar | grep "spring-ai" | head -10 || true

################################################################################

FROM package AS extracted

WORKDIR /build

RUN java -Djarmode=tools -jar target/app.jar extract --layers --launcher --destination target/extracted

################################################################################

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

COPY --from=extracted build/target/extracted/dependencies/ ./
COPY --from=extracted build/target/extracted/spring-boot-loader/ ./
COPY --from=extracted build/target/extracted/snapshot-dependencies/ ./
COPY --from=extracted build/target/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT [ "java", "org.springframework.boot.loader.launch.JarLauncher" ]