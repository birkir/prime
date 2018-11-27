#!/bin/bash

PACKAGES=$(ls ./packages)

for PACKAGE in ${PACKAGES[@]}
do
  if [[ "$PACKAGE" == "prime-field"* ]]; then
    GRAPHQL_FOLDER="./packages/$PACKAGE/node_modules/graphql"
    if [ -d $GRAPHQL_FOLDER ]; then
      echo "$PACKAGE: dirty (removed)"
      rm -rf $GRAPHQL_FOLDER
    else
      echo "$PACKAGE: clean"
    fi
  fi
done
