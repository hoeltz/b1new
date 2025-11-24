#!/usr/bin/env bash
# Script to add sample items and inbound movements to local dev server
BASE=http://localhost:4000/api
set -e

echo "Adding sample items..."
curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/items" -d '{"item_code":"BBK-001","item_name":"Bahan Baku Plastik","item_group":"bahan","unit":"PCS"}' | jq .
curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/items" -d '{"item_code":"PJ-001","item_name":"Produk Jadi Elektronik","item_group":"produk","unit":"PCS"}' | jq .
curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/items" -d '{"item_code":"AST-001","item_name":"Mesin Produksi CNC","item_group":"asset","unit":"UNIT"}' | jq .
curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/items" -d '{"item_code":"REJ-001","item_name":"Barang Reject/Scrap","item_group":"reject","unit":"PCS"}' | jq .
curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/items" -d '{"item_code":"BP-001","item_name":"Bahan Penolong Kimia","item_group":"bahan","unit":"PCS"}' | jq .

echo "Adding inbound movements (5 records)..."

curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/movements" -d '{"doc_type":"BC 2.6.1","doc_number":"BC2025-001","doc_date":"2025-11-24T08:00:00Z","receipt_number":"AWB-01","sender_name":"PT X","location_id":"WH-A","items":[{"item_code":"BBK-001","qty":100,"unit":"PCS","value_amount":500000,"value_currency":"IDR"}]}' | jq .

curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/movements" -d '{"doc_type":"BC 2.6.1","doc_number":"BC2025-002","doc_date":"2025-11-24T09:00:00Z","receipt_number":"AWB-02","sender_name":"PT X","location_id":"WH-A","items":[{"item_code":"PJ-001","qty":50,"unit":"PCS","value_amount":1000000,"value_currency":"IDR"}]}' | jq .

curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/movements" -d '{"doc_type":"BC 2.6.1","doc_number":"BC2025-003","doc_date":"2025-11-24T10:00:00Z","receipt_number":"AWB-03","sender_name":"PT X","location_id":"WH-A","items":[{"item_code":"AST-001","qty":5,"unit":"UNIT","value_amount":5000000,"value_currency":"IDR"}]}' | jq .

curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/movements" -d '{"doc_type":"BC 2.6.1","doc_number":"BC2025-004","doc_date":"2025-11-24T11:00:00Z","receipt_number":"AWB-04","sender_name":"PT X","location_id":"WH-A","items":[{"item_code":"REJ-001","qty":20,"unit":"PCS","value_amount":0,"value_currency":"IDR"}]}' | jq .

curl -s -X POST -H "Content-Type: application/json" "$BASE/inventory/movements" -d '{"doc_type":"BC 2.6.1","doc_number":"BC2025-005","doc_date":"2025-11-24T12:00:00Z","receipt_number":"AWB-05","sender_name":"PT X","location_id":"WH-A","items":[{"item_code":"BP-001","qty":30,"unit":"PCS","value_amount":150000,"value_currency":"IDR"}]}' | jq .

echo "Done. Use GET $BASE/inventory/movements to verify."
