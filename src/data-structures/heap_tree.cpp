#include "heap_tree.h"
#include <algorithm>
#include <limits>

void HeapTree::heapifyUp(int index) {
    while (index > 0) {
        int p = parent(index);
        if (heap[p] <= heap[index]) break;
        std::swap(heap[p], heap[index]);
        index = p;
    }
}

void HeapTree::heapifyDown(int index) {
    int n = static_cast<int>(heap.size());
    while (true) {
        int smallest = index;
        int left = leftChild(index);
        int right = rightChild(index);
        if (left < n && heap[left] < heap[smallest])
            smallest = left;
        if (right < n && heap[right] < heap[smallest])
            smallest = right;
        if (smallest == index) break;
        std::swap(heap[index], heap[smallest]);
        index = smallest;
    }
}

void HeapTree::insert(int value) {
    heap.push_back(value);
    heapifyUp(static_cast<int>(heap.size()) - 1);
}

int HeapTree::extractMin() {
    if (heap.empty()) return std::numeric_limits<int>::min();
    int minVal = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    if (!heap.empty())
        heapifyDown(0);
    return minVal;
}

crow::json::wvalue HeapTree::toJson() {
    crow::json::wvalue json;
    json["type"] = "heap";
    crow::json::wvalue arr(crow::json::type::List);
    for (size_t i = 0; i < heap.size(); i++) {
        crow::json::wvalue node;
        node["value"] = heap[i];
        node["index"] = static_cast<int>(i);
        arr[i] = std::move(node);
    }
    json["nodes"] = std::move(arr);
    json["size"] = static_cast<int>(heap.size());
    return json;
}
