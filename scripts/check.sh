#!/usr/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)
$SCRIPT_DIR/build.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

for file in `find $SCRIPT_DIR/../tests/stage_1 -name "*.nn"`;
do
    REALPATH_FILE=$(realpath $file)
    echo -e "${BLUE}Checking $REALPATH_FILE${NC}"
    python3 $SCRIPT_DIR/../src/index.py -qv $REALPATH_FILE
done
