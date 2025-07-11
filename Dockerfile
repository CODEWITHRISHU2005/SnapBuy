FROM openjdk:26-jdk
ADD target/SnapBuy-0.0.1-SNAPSHOT.jar SnapBuy.jar
ENTRYPOINT ["java", "-jar", "SnapBuy.jar"]