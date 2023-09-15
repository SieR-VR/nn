#!/usr/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)

python3 -m pegen $SCRIPT_DIR/../peg/nn.gram -o $SCRIPT_DIR/../nn_parser.py