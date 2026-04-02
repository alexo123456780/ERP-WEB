FROM liquibase/liquibase:4.27

USER root

RUN curl -fsSL \
    "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar" \
    -o /liquibase/lib/mysql-connector-j.jar && \
    chown liquibase:liquibase /liquibase/lib/mysql-connector-j.jar

USER liquibase

COPY --chown=liquibase:liquibase changelog/ /liquibase/changelog/
