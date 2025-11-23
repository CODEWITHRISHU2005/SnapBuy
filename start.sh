#!/bin/bash

cd /home/runner/workspace
export JAVA_HOME=/nix/store/k95pqfzyvrna93hc9a4cg5csl7l4fh0d-openjdk-21.0.7+6

java -jar target/SnapBuy-0.0.1-SNAPSHOT.jar
