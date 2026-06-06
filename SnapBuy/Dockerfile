FROM eclipse-temurin:21-jdk-jammy as deps

WORKDIR /build

COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

# No cache mount — forces fresh dependency download every build
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw dependency:go-offline -DskipTests

################################################################################

FROM deps as package

WORKDIR /build

COPY ./src src/

# No cache mount — guarantees clean build with correct pom.xml versions
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

################################################################################

FROM package as extract

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

COPY --from=extract build/target/extracted/dependencies/ ./
COPY --from=extract build/target/extracted/spring-boot-loader/ ./
COPY --from=extract build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract build/target/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT [ "java", "org.springframework.boot.loader.launch.JarLauncher" ]