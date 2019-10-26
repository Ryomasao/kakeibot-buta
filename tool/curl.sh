#!/bin/sh
curl -X POST -H "Content-Type: application/json" -d '{"text": "餃子に\n 12000いれる"}' localhost:8888/message